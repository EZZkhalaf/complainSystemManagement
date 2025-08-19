import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Type } from '@nestjs/common';

import { AddComplaintDto } from './dtos/add-complaint.dto';

import {  HandleComplaintInGroupDto } from './dtos/handle-complaint-in-group.dto';
import { sendComplaintEmail } from '../utils/send-complaints-email.util';
import { ChangeComplaintStatusDto } from './dtos/change-complaint-status.dto';
import * as nodemailer from 'nodemailer'
import { ListComplaintsDto } from './dtos/list-complaints.dto';
import { LogsService } from '../logs/logs.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { ComplaintEntity, ComplaintStatus, ComplaintType } from './entities/complaint.entity';
import { GroupEntity } from '../groups/entities/group.entity';
import { ComplaintGroupsRuleEntity } from './entities/complaint-groups-rule.entity';
import { RolesEntity } from '../roles/entities/roles.entity';
import { plainToInstance } from 'class-transformer';
import { PaginatedResponseDto } from './dtos/paginated-response.dto';
import { ComplaintOutputDto } from './dtos/complaint-output.dto';





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
        @InjectRepository(UserEntity) private userRepo : Repository<UserEntity>,
        @InjectRepository(ComplaintEntity) private complaintRepo : Repository<ComplaintEntity>,
        @InjectRepository(GroupEntity) private groupRepo : Repository<GroupEntity>,
        @InjectRepository(ComplaintGroupsRuleEntity) private complaintGroupsRuleRepo : Repository<ComplaintGroupsRuleEntity>,
        @InjectRepository(RolesEntity) private rolesRepo : Repository<RolesEntity>
    ){}


    
    async addComplaint(addComplaintDto: AddComplaintDto, userId: number) {
        const { description, type } = addComplaintDto;
        const typeEnum: ComplaintType = {
            general: ComplaintType.GENERAL,
            technical: ComplaintType.TECHNICAL,
            billing: ComplaintType.BILLING,
            other: ComplaintType.OTHER,
        }[addComplaintDto.type] || ComplaintType.GENERAL;
        if (!description || !userId) {
            throw new BadRequestException('Description and userId are required');
        }

        const user = await this.userRepo.findOne({ 
            where: { user_id: userId } 
            
        });
        if (!user) throw new NotFoundException('User not found');

        const group1 = await this.groupRepo.findOne({ where: { group_name: 'HR' } });
        if (!group1) throw new NotFoundException('No default group to take the complaint');


        const newComplaint = this.complaintRepo.create({
            description,
            complaint_type: typeEnum,
            creator_user: user,
            groupsQueue: [group1]
        });

        await this.complaintRepo.save(newComplaint);

        return {
            success: true,
            message: 'Complaint added successfully',
        };
    }



    

    async handleComplaintInGroup(id: string, dto: HandleComplaintInGroupDto) {
        const { userId, status } = dto;


        const complaint =  await this.complaintRepo.findOne({
            where : {complaint_id : Number(id)},
            relations : ["creator_user" , 'groupsQueue']
        })
        if (!complaint) throw new NotFoundException('Complaint not found');

        const user = await this.userRepo.findOne({
            where : {user_id : Number(userId)}
        })
        const rule = await this.complaintGroupsRuleRepo.findOne({
            order: { id: "ASC" } ,
            where:{} ,
            relations:['groups'] 
        });

        const groups = rule?.groups;
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


        
        const userDoc = complaint.creator_user ;
        if (status === 'accept') {
        complaint.groupsQueue.push(currentGroup);
        if (currentStep === groups.length - 1) {
            complaint.complaint_status = ComplaintStatus.RESOLVED;
            await this.complaintRepo.save(complaint)
            await sendComplaintEmail(userDoc.user_email, 'Resolved', userDoc.user_name);
            await this.logsService.logAction(user, 'Resolve', 'Complaint', complaint.complaint_id, `Final group resolved the complaint.`);
            return {
            success : true ,
            status: 200,
            body: { success: true, message: 'Complaint resolved and user notified.', complaint },
            };
        } else {
            complaint.complaint_status = ComplaintStatus.IN_PROGRESS;
            await this.complaintRepo.save(complaint)
            await this.logsService.logAction(user, 'Accept', 'Complaint', complaint.complaint_id, `Complaint accepted by one of the groups in the rule.`);
            return {
                success : true,
                status: 200,
                body: { success: true, message: 'Accepted and passed to next group.', complaint },
            };
        }
        }

        if (status === 'reject') {
            complaint.complaint_status = ComplaintStatus.REJECTED;
            complaint.groupsQueue.push(currentGroup);
            await this.complaintRepo.save(complaint)
            await sendComplaintEmail(userDoc.user_email, 'rejected', userDoc.user_name);
            await this.logsService.logAction(user, 'Reject', 'Complaint', complaint.complaint_id, `Complaint Rejected by the complaint groups rule .`);
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

        // const user = await this.roleModel.findOne({ user: userId });
        const user = await this.userRepo.findOne({
            where : {user_id : Number(userId)},
            select:{
                user_id : true ,
                user_email : true ,
                user_name : true ,
                user_role : {role_id : true , role_name : true} ,
                user_password:false
            }
        })
        if (!user) {
            throw new NotFoundException('User role not found');
        }

        const group = await this.groupRepo.findOne({
            where : {group_id : Number(groupId)}
        })
        if (!group) {
            throw new NotFoundException('Group not found');
        }

        

        const complaint = await this.complaintRepo.findOne({
            where : {complaint_id : Number(complaintId)},
            relations : ['creator_user' , 'creator_user.user_role'] ,
            select :{
                complaint_id : true ,
                complaint_status : true ,
                complaint_type : true ,
                created_at : true ,
                creator_user:{
                    created_at : true ,
                    profilePicture : true ,
                    user_name : true ,
                    user_email : true ,
                    user_id : true,
                    user_role : {
                        role_name : true ,
                        role_id : true
                    }
                }
            }
        })

       
        if (!complaint) {
            throw new NotFoundException('Complaint not found');
        }

        const oldStatus = complaint.complaint_status;

        complaint.complaint_status = status as ComplaintStatus;
        // const complaintId = (complaint._id as Types.ObjectId).toString()
        complaint.groupsQueue.push(group)
        // await complaint.save();

        await this.complaintRepo.save(complaint)

        // Ensure the populated user object is typed
        const complaintUser = complaint.creator_user;

        // Send email
        await this.sendEmail({
            to: complaintUser.user_email,
            name: complaintUser.user_name,
            status,
        });

        // Log action
        await this.logsService.logAction(
            user,
            'Change-Status',
            'Complaint',
            complaint.complaint_id,
            `Changed the Complaint ${complaint.complaint_id} from ${oldStatus} to ${complaint.complaint_status}`
        );

        return {
            success: true,
            message: 'Complaint status updated and email sent',
            complaint,
        };
    }

   
    async listComplaints(dto: ListComplaintsDto): Promise<any> {
        const { page , limit } = dto;

        const skip = (page - 1) * limit;
        // const totalCount = await this.complaintModel.countDocuments();
        const totalCount = await this.complaintRepo.count()

        const complaints = await this.complaintRepo.find({
            relations: ["creator_user"],       
            select: {
                creator_user: { user_password: false }, 
            },
            order: { created_at: "DESC" },      
            skip: skip,
            take: limit,
        });


        // return {
        //     success: true,
        //     complaints,
        //     currentPage: page,
        //     totalPages: Math.ceil(totalCount / limit),
        // };

        return plainToInstance(
            PaginatedResponseDto , {
                success : true ,
                complaints : complaints.map( c => 
                    plainToInstance(ComplaintOutputDto , c , {
                        excludeExtraneousValues : true
                    })
                ),
                currenPage : page , 
                totalPages : Math.ceil(totalCount/limit),
                totalCount
            } ,
            {excludeExtraneousValues : true}
        )
    }

    async getComplaintInfo(id : string) : Promise<{ success: boolean; complaint: ComplaintOutputDto }>{
        
        if(!id)
            throw new BadRequestException("please provide the correct id")

        // const complaint = await this.complaintModel.findById(id).populate("userId" , "-password");
        const complaint = await this.complaintRepo.findOne({
            where :{complaint_id : Number(id)},
            relations:['creator_user'],
            select : {
                complaint_id : true ,
                complaint_status : true ,
                complaint_type : true ,
                created_at : true ,
                creator_user :{
                    user_email : true ,
                    profilePicture : true ,
                    user_id : true ,
                    user_name : true ,
                    user_password : false ,
                    user_role : false
                }
            }
        })

        if(!complaint){
            throw new NotFoundException("complaint not found")
        }
        return {
            success : true , complaint : plainToInstance(ComplaintOutputDto , complaint , {excludeExtraneousValues : true})
        }
    }

    async listUsrComplaints( id : string){
        // const userExists = await this.userModel.findById(id)
        const userExists = await this.userRepo.findOne({
            where : {user_id : Number(id)}
        })
        if(!userExists)
            throw new NotFoundException(" user not found ")
        
        // const complaints = await this.complaintModel.find({userId : id})
        const complaints = await this.complaintRepo.find({
            where : {creator_user : {user_id : Number(id)}} ,
            relations : ['creator_user'],
            select : {
                complaint_id : true ,
                complaint_status : true , 
                complaint_type : true ,
                created_at : true  ,
                creator_user : {
                    user_name : true ,
                    user_email : true ,
                    user_id : true,
                    user_password : false ,
                    user_role : false
                }
            }
        })
        // console.log(complaints)
        return {success : true , complaints : plainToInstance(ComplaintOutputDto , complaints , {excludeExtraneousValues : true})}
    }



    async deleteComplaint(userId: string, complaintId: string) {
        const parsedComplaintId = Number(complaintId);
        const parsedUserId = Number(userId);

        
        if (isNaN(parsedComplaintId) || isNaN(parsedUserId)) {
            throw new BadRequestException("Invalid userId or complaintId");
        }

        const complaint = await this.complaintRepo.findOne({
            where: { complaint_id: parsedComplaintId },
            relations: ['creator_user'] // needed for isOwner check
        });
        if (!complaint) {
            throw new NotFoundException("complaint not found");
        }

        const user = await this.rolesRepo.findOne({
            where: { users: { user_id: parsedUserId } },
            relations: ['users']
        });
        if (!user) {
            throw new NotFoundException("user not found");
        }

        const isOwner = complaint.creator_user.user_id === parsedUserId;

        await this.complaintRepo.delete(parsedComplaintId);

        return {
            success: true,
            message: `Complaint deleted successfully${isOwner ? " (owned by user)" : ""}`
        };
    }



}
