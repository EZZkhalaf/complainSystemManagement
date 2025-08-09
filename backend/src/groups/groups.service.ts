import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dtos/create-group.dto';
import { RemoveUserFromGroupDto } from './dtos/remove-user-from-group.dto';
import { IsMongoId } from 'class-validator';
import { Complaint, ComplaintDocument } from 'src/complaint/schemas/complaint.schema';
import { ListGroupComplaintsDto } from './dtos/list-group-complaints.dto';
import { ComplaintGroupsRule, ComplaintGroupsRuleDocument } from 'src/complaint/schemas/complaint-groups-rule.schema';
import { RolesModule } from 'src/roles/roles.module';

@Injectable()
export class GroupsService {

    constructor(
        @InjectModel(User.name) private userModel : Model<UserDocument> ,
        @InjectModel(Group.name) private groupModel : Model<GroupDocument> , 
        @InjectModel(Complaint.name) private complaintModel : Model<ComplaintDocument>,
        @InjectModel(ComplaintGroupsRule.name) private complaintGroupsRule : Model<ComplaintGroupsRuleDocument>
    ){}


    async createGroup(userId: string, dto: CreateGroupDto) {
        const { name, description } = dto;

        const nameExists = await this.groupModel.findOne({ name });
        if (nameExists) {
            throw new BadRequestException('Group name already exists');
        }

        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const newGroup = await this.groupModel.create({
            name,
            description,
            createdBy: userId,
        });

        // await logAction(user, "Create-Group", "Group", newGroup._id, `Created the Group: ${newGroup.name}`);

        return {
            success: true,
            message: 'Group created successfully',
            group: newGroup,
        };
    }

    async removeUserFomeGroup(dto : RemoveUserFromGroupDto){
        const {groupId , userId} = dto;

        const group = await this.groupModel.findById(groupId)
        if(!group)
            throw new NotFoundException('Group not found');
        const user = await this.userModel.findById(userId);
        if(!user)
            throw new NotFoundException("user not found")

        if(!group.users.some( id => id.toString() === userId.toString()))
            throw new BadRequestException("user is not in the group  to remove")

        group.users = group.users.filter(id=> id.toString() !== userId.toString())
        await group.save()
        // await logAction(user, "Remove-User", "Group", group._id, `Has Been Removed From Group ${group.name}`);
        return {
            success: true,
            message: 'User removed from group successfully',
            group,
        };
    }

    async deleteGroup(user: any, groupId: string) {
        // Manual MongoDB ObjectId validation
        if (!isValidObjectId(groupId)) {
        throw new BadRequestException('Invalid groupId format');
        }

        const group = await this.groupModel.findById(groupId);
        if (!group) {
        throw new NotFoundException('Group not found');
        }

        await this.groupModel.findByIdAndDelete(groupId);

        await this.complaintModel.updateMany(
        { groupsQueue: groupId },
        { $pull: { groupsQueue: groupId } }
        );

        // await logAction(user, "Delete-Group", "Group", group._id, `Has Deleted Group: ${group.name}`);

        return { success: true, message: 'Group deleted successfully' };
    }

    async getGroupInfoAndUsers(groupId : string){
        if (!isValidObjectId(groupId)) {
            throw new BadRequestException('Invalid groupId format');
        }
        const group = await this.groupModel.findById(groupId).populate("users" , "-password")

        if(!group)
            throw new NotFoundException("group not found")

        return { success: true, group }
    }


    async getUserGroups(userId : string){
        if(!isValidObjectId(userId))
            throw new BadRequestException("invalid user id")

        const groups = await this.groupModel.find({users : userId}).populate("users","-password")
        return { success: true, groups }

    }

    async listGroups(id : string){
        if(!isValidObjectId(id))
            throw new BadRequestException("invalid admin id ")
        const groups = await this.groupModel.find().populate("users" , "-password")
        return {success:true , groups}
    }

    async listGroupComplaints(groupId  :string , dto : ListGroupComplaintsDto){
        const { userId,type,status,page,limit} = dto
        if(!isValidObjectId(userId) || !isValidObjectId(groupId))
            throw new BadRequestException("invalid inserted id ")
        const group = await this.groupModel.findById(groupId);
        if (!group) {
            throw new NotFoundException('Group not found');
        }

        const inTheGroup = group.users.some(user => user.equals(userId));
        if (!inTheGroup) {
            throw new ForbiddenException('User is not allowed to view other groups complaints');
        }

        const skip = (page - 1 )* limit

        const filter : any = {
            $expr :{
                $eq :[
                    {$arrayElemAt : ['$groupsQueue' , -1]},
                    new Types.ObjectId(groupId)
                ]
            }
        }

        if(type) filter.type = type
        if(status) filter.status = status;

        const complaints = await this.complaintModel
            .find(filter)
            .sort({createdAt : -1})
            .skip(skip)
            .limit(Number(limit))

        const total = await this.complaintModel.countDocuments(filter);

        return {
            success: true,
            complaints,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
        };
    }

    async searchGroups(search : string){
        const groups = await this.groupModel.find({name : {$regex : search , $options : "i"}})
        return {success : true , groups}
    }

    async addGroupToRule(id : string , groupId : string){
        if(!isValidObjectId(groupId) || !isValidObjectId(id))
            throw new BadRequestException("invalid id ")

        const user = await this.userModel.findById(id)
        if(!user)
            throw new NotFoundException("user not found ")
        const group = await this.groupModel.findById(groupId)
        if(!group)
            throw new NotFoundException("group not found")

        let rule = await this.complaintGroupsRule.findOne()
        if(!rule){
            rule = await this.complaintGroupsRule.create({
                groupsSequence:[groupId]
            })
            return {success : true , rule}
        }
        if(rule.groupsSequence.some( g=> g.toString() === groupId)){
            return {success: false, message : "group already in the complaint groups sequence"}
        }else {
            rule.groupsSequence.push(new Types.ObjectId(groupId));
            
            await rule.save();
            
            rule = await rule.populate("groupsSequence")
            
            // await logAction(user , "Edit-Rule" , "Rule" , rule._id , `The User Has Added Group ${group.name} from Rule`)
        
            return {success : true , rule , groupsSequence : rule.groupsSequence}
        }


    }

    async removeGroupFromRule(id : string , groupId : string){
        if(!isValidObjectId(groupId) || !isValidObjectId(id))
            throw new BadRequestException("invalid id ")
        const user = await this.userModel.findById(id);
        if(!user)
            throw new NotFoundException("user not found ")

        const group = await this.groupModel.findById(groupId)
        if(!group)
            throw new NotFoundException("group not found ")

        let rule = await this.complaintGroupsRule.findOne({groupsSequence:groupId})
        if(!rule)
            throw new NotFoundException("rule not found")

        rule.groupsSequence = rule.groupsSequence.filter((g)=> g.toString() !== groupId.toString())

        await rule.save()
        rule = await rule.populate("groupsSequence")

        // await logAction(user , "Edit-Rule" , "Rule" , rule._id , `The User Has Removed Group ${group.name} from Rule`)

        return {success : true , rule , groupsSequence : rule.groupsSequence}
    }

    async getRules(){
        const rule = await this.complaintGroupsRule.findOne().populate("groupsSequence" , "-users")
        return { success: true, rule }
    }
}
