import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { AddComplaintDto } from './dtos/add-complaint.dto';
import { Group, GroupDocument } from 'src/groups/schemas/group.schema';
import { Complaint, ComplaintDocument } from './schemas/complaint.schema';
import {  HandleComplaintInGroupDto } from './dtos/handle-complaint-in-group.dto';
import { ComplaintGroupsRule } from './schemas/complaint-groups-rule.schema';
import { stat } from 'fs';
import { sendComplaintEmail } from 'src/utils/send-complaints-email.util';
import { ChangeComplaintStatusDto } from './dtos/change-complaint-status.dto';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { sendEmail } from 'src/utils/email.util';
import * as nodemailer from 'nodemailer'
import { ListComplaintsDto } from './dtos/list-complaints.dto';
import { LogsService } from 'src/logs/logs.service';





@Injectable()
export class ComplaintService {
    private async sendEmail({
        to,
        name,
        status,
        }: { to: string; name: string; status: string }) {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Complaint Status Updated',
            html: `<p>Hello ${name},</p>
                <p>Your complaint status has been updated to <strong>${status}</strong>.</p>`,
        };

           

        await transporter.sendMail(mailOptions);
    }

    constructor(
        private readonly logsService : LogsService,
        @InjectModel(Complaint.name) private complaintModel : Model<ComplaintDocument>,
        @InjectModel(ComplaintGroupsRule.name) private complaintGroupsRule : Model<ComplaintGroupsRule>,
        @InjectModel(Role.name) private roleModel : Model<RoleDocument>,
        @InjectModel(User.name) private userModel : Model<UserDocument> ,
        @InjectModel(Group.name) private groupModel : Model<GroupDocument>
    ){}

    async addComplaint(addComplaintDto : AddComplaintDto , userId : string){
        const {description , type } = addComplaintDto;
        if (!description || !userId) {
            throw new BadRequestException('Description and userId are required');
        }
        const user = await this.userModel.findById(userId);

        const group1 = await this.groupModel.findOne({name : "HR"})
        if(!group1){
            throw new NotFoundException('No default group to take the complaint');
        }

        const newComplaint = await this.complaintModel.create({
            description,
            userId: userId,
            type: type ,
            groupsQueue : [group1._id]
        })

        try {
            await newComplaint.save();
            const complaintId = (newComplaint._id as Types.ObjectId).toString();
            await this.logsService.logAction(user, 'Add-Complaint', 'User', complaintId , `added new Complaint with type ${type}`);
        } catch (error) {
            throw new InternalServerErrorException('Complaint creation failed');
        }


        return {
            success: true,
            message: 'Complaint added successfully',
            complaint: newComplaint,
        };

    }


    

    ///////
    async handleComplaintInGroup(id: string, dto: HandleComplaintInGroupDto) {
        const { userId, status } = dto;

        const complaint = await this.complaintModel
        .findById(id)
        .populate('userId');
        if (!complaint) throw new NotFoundException('Complaint not found');

        const user = await this.userModel.findById(userId);

        const rule = await this.complaintGroupsRule.findOne();
        const groups = rule?.groupsSequence;
        const currentStep = complaint.groupsQueue.length;

        if (!groups || !Array.isArray(groups))
            return {
                success : false,
                status: 500,
                body: { success: false, message: 'Group sequence rule is missing or invalid.' },
            };

        if (currentStep > groups?.length )
            return {
                success : false,
                status: 400,
                body: { success: false, message: 'Complaint already handled' },
            };

        const currentGroup = groups[currentStep];

        if (complaint.groupsQueue.includes(currentGroup))
        return {
            success : false,
            status: 400,
            body: { success: false, message: 'Current group already handled this complaint.' },
        };


        const userDoc = complaint.userId as User;
        if (status === 'accept') {
        complaint.groupsQueue.push(currentGroup);
        if (currentStep === groups.length - 1) {
            complaint.status = 'resolved';
            await complaint.save();
            const complaintId = (complaint._id as Types.ObjectId).toString()
            await sendComplaintEmail(userDoc.email, 'Resolved', userDoc.name);
            await this.logsService.logAction(user, 'Resolve', 'Complaint', complaintId, `Final group resolved the complaint.`);
            return {
            success : true ,
            status: 200,
            body: { success: true, message: 'Complaint resolved and user notified.', complaint },
            };
        } else {
            complaint.status = 'in-progress';
            await complaint.save();
            const complaintId = (complaint._id as Types.ObjectId).toString()
            await this.logsService.logAction(user, 'Accept', 'Complaint', complaintId, `Complaint accepted by group ${currentGroup}.`);
            return {
                success : true,
                status: 200,
                body: { success: true, message: 'Accepted and passed to next group.', complaint },
            };
        }
        }

        if (status === 'reject') {
            complaint.status = 'rejected';
            complaint.groupsQueue.push(currentGroup);
            await complaint.save();
            await sendComplaintEmail(userDoc.email, 'rejected', userDoc.name);
            const complaintId = (complaint._id as Types.ObjectId).toString()
            await this.logsService.logAction(user, 'Reject', 'Complaint', complaintId, `Complaint Rejected by group ${currentGroup}.`);
            return {
                success : true ,
                status: 200,
                body: { success: true, message: 'Rejected and notified the user.', complaint },
            };
        }

        return {
            status: 400,
            body: { success: false, message: "Invalid status. Use 'accept' or 'reject' only." },
        };
    }

    async changeComplaintStatus(dto : ChangeComplaintStatusDto){
        const { complaintId, status, userId, groupId } = dto;

        const user = await this.roleModel.findOne({ user: userId });
        if (!user) {
            throw new NotFoundException('User role not found');
        }

        const group = await this.groupModel.findById(groupId);
        if (!group) {
            throw new NotFoundException('Group not found');
        }

        const complaint = await this.complaintModel
            .findById(complaintId)
            .populate('userId');

        if (!complaint) {
            throw new NotFoundException('Complaint not found');
        }

        const oldStatus = complaint.status;

        complaint.status = status;
        // const complaintId = (complaint._id as Types.ObjectId).toString()
        complaint.groupsQueue.push(group._id)
        await complaint.save();

        // Ensure the populated user object is typed
        const complaintUser = complaint.userId as User;

        // Send email
        await this.sendEmail({
            to: complaintUser.email,
            name: complaintUser.name,
            status,
        });

        // Log action
        await this.logsService.logAction(
            user,
            'Change-Status',
            'Complaint',
            complaintId,
            `Changed the Complaint ${complaint._id} from ${oldStatus} to ${complaint.status}`
        );

        return {
            success: true,
            message: 'Complaint status updated and email sent',
            complaint,
        };
    }


    async listComplaints(dto: ListComplaintsDto): Promise<{
        success: boolean;
        complaints: ComplaintDocument[];
        currentPage: number;
        totalPages: number;
    }> {
    const { page , limit } = dto;

    const skip = (page - 1) * limit;
    const totalCount = await this.complaintModel.countDocuments();

    const complaints = await this.complaintModel
        .find()
        .populate("userId", "-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        success: true,
        complaints,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
    };
}

    async getComplaintInfo(id : string) : Promise<{ success: boolean; complaint: ComplaintDocument }>{
        
        if(!id)
            throw new BadRequestException("please provide the correct id")

        const complaint = await this.complaintModel.findById(id).populate("userId" , "-password");

        if(!complaint){
            throw new NotFoundException("complaint not found")
        }
        return {
            success : true , complaint
        }
    }

    async listUsrComplaints( id : string) : Promise<{success : boolean , complaints : ComplaintDocument[]}>{
        const userExists = await this.userModel.findById(id)
        if(!userExists)
            throw new NotFoundException(" user not found ")

        const complaints = await this.complaintModel.find({userId : id})
        return {success : true , complaints}
    }



    async deleteComplaint(userId : string , complaintId : string){
        const complaint = await this.complaintModel.findById(complaintId)
        if(!complaint)
            throw new NotFoundException("complaint not found");

        const user = await this.roleModel.findOne({user : userId}).populate("user","-password");
        if(!user)
            throw new NotFoundException("user not found")

        const isOwner = complaint.userId.toString() === userId
        await this.complaintModel.findByIdAndDelete(complaintId)

        await this.logsService.logAction(user , "Delete-Complaint" , "Complaint" , complaintId , `The User Deleted ${isOwner ? "His " : "The "} Complaint With Id ${complaint._id}`)

        return {
            success: true, message: "Complaint deleted successfully"
        }

        
    }


}
