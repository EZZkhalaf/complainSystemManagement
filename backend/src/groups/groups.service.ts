import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Type } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { isValidObjectId, Model, Types } from 'mongoose';
// import { User, UserDocument } from 'src/user/schemas/user.schema';
// import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dtos/create-group.dto';
import { RemoveUserFromGroupDto } from './dtos/remove-user-from-group.dto';
// import { IsMongoId } from 'class-validator';
// import { Complaint, ComplaintDocument } from 'src/complaint/schemas/complaint.schema';
import { ListGroupComplaintsDto } from './dtos/list-group-complaints.dto';
// import { ComplaintGroupsRule, ComplaintGroupsRuleDocument } from 'src/complaint/schemas/complaint-groups-rule.schema';
// import { RolesModule } from 'src/roles/roles.module';
import { LogsService } from 'src/logs/logs.service';
// import { UserIdParameterDto } from './dtos/user-id-parameter.dto';
// import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { ComplaintEntity } from 'src/complaint/entities/complaint.entity';
import { ComplaintGroupsRuleEntity } from 'src/complaint/entities/complaint-groups-rule.entity';
import { plainToInstance } from 'class-transformer';
import { GroupOutputDto } from './dtos/group-output.dto';

@Injectable()
export class GroupsService {

    constructor(
        private readonly logsService : LogsService,
        // @InjectModel(User.name) private userModel : Model<UserDocument> ,
        // @InjectModel(Group.name) private groupModel : Model<GroupDocument> , 
        // @InjectModel(Role.name) private roleModel : Model<RoleDocument>,
        // @InjectModel(Complaint.name) private complaintModel : Model<ComplaintDocument>,
        // @InjectModel(ComplaintGroupsRule.name) private complaintGroupsRule : Model<ComplaintGroupsRuleDocument> ,


        @InjectRepository(GroupEntity) private groupRepo : Repository<GroupEntity>,
        @InjectRepository(UserEntity) private userRepo : Repository<UserEntity> ,
        @InjectRepository(ComplaintEntity) private complaintRepo : Repository<ComplaintEntity>,
        @InjectRepository(ComplaintGroupsRuleEntity) private complaintGroupsRuleRepo : Repository<ComplaintGroupsRuleEntity>
    ){}


    // async createGroup(userId: string, dto: CreateGroupDto) {
    //     const { name, description } = dto;
    //     // const { userId } = userIdDto
    //     const nameExists = await this.groupModel.findOne({ name });
    //     if (nameExists) {
    //         throw new BadRequestException('Group name already exists');
    //     }
        
    //     const user = await this.userModel.findById(userId);
    //     console.log(userId)
    //     if (!user) {
    //         throw new NotFoundException('User not found');
    //     }

    //     const newGroup = await this.groupModel.create({
    //         name,
    //         description,
    //         createdBy: userId,
    //     });

    //     const groupId = (newGroup._id as Types.ObjectId).toString()
    //     await this.logsService.logAction(user, "Create-Group", "Group",groupId, `Created the Group: ${newGroup.name}`);

    //     return {
    //         success: true,
    //         message: 'Group created successfully',
    //         group: newGroup,
    //     };
    // }

    async createGroup(userId: string, dto: CreateGroupDto) {
        const { name, description } = dto;

        const nameExists = await this.groupRepo.findOne({
            where: { group_name: name }
        });
        if (nameExists) {
            throw new BadRequestException('Group name already exists');
        }

        const user = await this.userRepo.findOne({
            where: { user_id: Number(userId) }
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const newGroup = this.groupRepo.create({
            group_name: name,
            // group_description: description, // if you add this column in entity
            users: [user] // or [] if no users at creation
        });

        await this.groupRepo.save(newGroup);

        await this.logsService.logAction(
            user,
            'Create-Group',
            'Group',
            newGroup.group_id,
            `Created the Group called : (${newGroup.group_name})`
        );
        return {
            success: true,
            message: 'Group created successfully',
            group: newGroup,
        };
    }


    // async removeUserFomeGroup(dto : RemoveUserFromGroupDto){
    //     const {groupId , userId} = dto;

    //     const group = await this.groupModel.findById(groupId)
    //     if(!group)
    //         throw new NotFoundException('Group not found');
    //     const user = await this.userModel.findById(userId);
    //     if(!user)
    //         throw new NotFoundException("user not found")

    //     if(!group.users.some( id => id.toString() === userId.toString()))
    //         throw new BadRequestException("user is not in the group  to remove")

    //     group.users = group.users.filter(id=> id.toString() !== userId.toString())
    //     await group.save()
    //     // await logAction(user, "Remove-User", "Group", group._id, `Has Been Removed From Group ${group.name}`);
    //     return {
    //         success: true,
    //         message: 'User removed from group successfully',
    //         group,
    //     };
    // }


    async removeUserFomeGroup(dto : RemoveUserFromGroupDto){
        const {groupId , userId} = dto;

        // const group = await this.groupModel.findById(groupId)
        const group = await this.groupRepo.findOne({
            where : {group_id : groupId},
            relations:['users']
        })
        if(!group)
            throw new NotFoundException('Group not found');

        // const user = await this.userModel.findById(userId);
        const user = await this.userRepo.findOne({
            where :{user_id : Number(userId)}
        })
        if(!user)
            throw new NotFoundException("user not found")

        // if(!group.users.some( id => id.toString() === userId.toString()))
        //     throw new BadRequestException("user is not in the group  to remove")

        if(!group.users.some(user => user.user_id === userId))
            throw new BadRequestException("user is not in the group  to remove")


        // group.users = group.users.filter(id=> id.toString() !== userId.toString())

        group.users = group.users.filter(user => user.user_id !== userId)
        await this.groupRepo.save(group)
        await this.logsService.logAction(user, "Remove-User", "Group", group.group_id, `Has Been Removed From Group ${group.group_name}`);
        return {
            success: true,
            message: 'User removed from group successfully',
            group,
        };
    }




    // async getGroupInfoAndUsers(groupId : string){
    //     if (!isValidObjectId(groupId)) {
    //         throw new BadRequestException('Invalid groupId format');
    //     }
    //     const group = await this.groupModel.findById(groupId).populate("users" , "-password")
        

    //     if(!group)
    //         throw new NotFoundException("group not found")

    //     return { success: true, group }
    // }

    async getGroupInfoAndUsers(groupId : string){
        // if (!isValidObjectId(groupId)) {
        //     throw new BadRequestException('Invalid groupId format');
        // }
        // const group = await this.groupModel.findById(groupId).populate("users" , "-password")
        const group = await this.groupRepo.findOne({
            where : {group_id : Number(groupId)},
            relations : ['users']
        })

        if(!group)
            throw new NotFoundException("group not found")

        return { success: true, group : plainToInstance(GroupOutputDto , group , {excludeExtraneousValues:true}) }
    }


    // async deleteGroup(user: any, groupId: string) {
    //     // Manual MongoDB ObjectId validation
    //     if (!isValidObjectId(groupId)) {
    //     throw new BadRequestException('Invalid groupId format');
    //     }
        

    //     const group = await this.groupModel.findById(groupId);
    //     if (!group) {
    //     throw new NotFoundException('Group not found');
    //     }

    //     await this.groupModel.findByIdAndDelete(groupId);

    //     await this.complaintModel.updateMany(
    //     { groupsQueue: groupId },
    //     { $pull: { groupsQueue: groupId } }
    //     );

    //     await this.logsService.logAction(user, "Delete-Group", "Group", groupId, `Has Deleted Group: ${group.name}`);

    //     return { success: true, message: 'Group deleted successfully' };
    // }

    async deleteGroup(user: any, groupId: string) {
        const groupIdNum = Number(groupId);



        // Find the group with its rules
        const group = await this.groupRepo.findOne({
            where: { group_id: groupIdNum },
            relations: { complaintGroupsRules: true },
        });


        if (!group) {
            throw new NotFoundException('Group not found');
        }

        // Remove the group from each rule it’s linked to
        for (const rule of group.complaintGroupsRules) {
            await this.complaintGroupsRuleRepo
            .createQueryBuilder()
            .relation(ComplaintGroupsRuleEntity, 'groups')
            .of(rule.id) 
            .remove(groupIdNum);
        }

        // Delete the group
        await this.groupRepo.remove(group);

        await this.logsService.logAction(user, "Delete-Group", "Group", group.group_id, `Has Deleted The Group ${group.group_name}`);

        return { success: true, message: 'Group deleted successfully' };
    }





    // async getUserGroups(userId : string){
    //     if(!isValidObjectId(userId))
    //         throw new BadRequestException("invalid user id")

    //     const groups = await this.groupModel.find({users : userId}).populate("users","-password")
    //     return { success: true, groups }

    // }

    // async listGroups(id : string){
    //     if(!isValidObjectId(id))
    //         throw new BadRequestException("invalid admin id ")
    //     const groups = await this.groupModel.find().populate("users" , "-password")
    //     return {success:true , groups}
    // }


    async getUserGroups(userId : string){
        // if(!isValidObjectId(userId))
        //     throw new BadRequestException("invalid user id")

        // const groups = await this.groupModel.find({users : userId}).populate("users","-password")
        const groups = await this.groupRepo.find({
            where : {users :{user_id :  Number(userId)}},
            relations : ['users']
        })
        return { success: true, groups :  plainToInstance(GroupOutputDto , groups , {excludeExtraneousValues : true}) }

    }

    async listGroups(id : string){
        // if(!isValidObjectId(id))
        //     throw new BadRequestException("invalid admin id ")
        // const groups = await this.groupModel.find().populate("users" , "-password")
        const groups = await this.groupRepo.find({
            relations : ['users'],
            select : {
                group_id :true,
                group_name :true,
                users:{
                    user_id:true ,
                    user_name: true ,
                    user_email : true
                }

            }
        })
        return {success:true , groups}
    }

    // async listGroupComplaints(groupId  :string , dto : ListGroupComplaintsDto){
    //     const { userId,type,status,page,limit} = dto
    //     if(!isValidObjectId(userId) || !isValidObjectId(groupId))
    //         throw new BadRequestException("invalid inserted id ")
    //     const group = await this.groupModel.findById(groupId);
    //     if (!group) {
    //         throw new NotFoundException('Group not found');
    //     }

    //     const inTheGroup = group.users.some(user => user.equals(userId));
    //     if (!inTheGroup) {
    //         throw new ForbiddenException('User is not allowed to view other groups complaints');
    //     }

    //     const skip = (page - 1 )* limit

    //     const filter : any = {
    //         $expr :{
    //             $eq :[
    //                 {$arrayElemAt : ['$groupsQueue' , -1]},
    //                 new Types.ObjectId(groupId)
    //             ]
    //         }
    //     }

    //     if(type) filter.type = type
    //     if(status) filter.status = status;

    //     const complaints = await this.complaintModel
    //         .find(filter)
    //         .sort({createdAt : -1})
    //         .skip(skip)
    //         .limit(Number(limit))

    //     const total = await this.complaintModel.countDocuments(filter);

    //     return {
    //         success: true,
    //         complaints,
    //         total,
    //         page: Number(page),
    //         totalPages: Math.ceil(total / limit),
    //     };
    // }

    async listGroupComplaints(groupId  :string , dto : ListGroupComplaintsDto){
        const { userId,type,status,page,limit} = dto
        
        const groupIdNum = Number(groupId)
        const userIdNum = Number(userId);

        const  group = await this.groupRepo.findOne({
            where : {group_id : groupIdNum},
            relations:['users']
        })

        if(!group)
            throw new NotFoundException("group not found")

        const inTheGroup = group.users.some( u => u.user_id === userIdNum)
        if (!inTheGroup) {
            throw new ForbiddenException('User is not allowed to view other groups complaints');
        }

        const [complaints, total] = await this.complaintRepo
                .createQueryBuilder('complaint_info')
                .innerJoin('complaint_info.groupsQueue', 'group_entity')
                .where('group_entity.group_id = :groupId', { groupId: groupIdNum })
                .andWhere(type ? 'complaint_info.complaint_type = :type' : '1=1', { type })
                .andWhere(status ? 'complaint_info.complaint_status = :status' : '1=1', { status })
                .orderBy('complaint_info.created_at', 'DESC')
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

        return {
            success: true,
            complaints,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
        };
    }

    // async searchGroups(search : string){
    //     const groups = await this.groupModel.find({name : {$regex : search , $options : "i"}})
    //     return {success : true , groups}
    // }

    async searchGroups(search: string) {
        const groups = await this.groupRepo
            .createQueryBuilder('group')
            .where('group.group_name ILIKE :search', { search: `%${search}%` })
            .getMany();

        return { success: true, groups };
    }


    // async addGroupToRule(id : string , groupId : string){
    //     if(!isValidObjectId(groupId) || !isValidObjectId(id))
    //         throw new BadRequestException("invalid id ")

    //     const user = await this.userModel.findById(id)
    //     if(!user)
    //         throw new NotFoundException("user not found ")
    //     const group = await this.groupModel.findById(groupId)
    //     if(!group)
    //         throw new NotFoundException("group not found")

    //     let rule = await this.complaintGroupsRule.findOne()
    //     if(!rule){
    //         rule = await this.complaintGroupsRule.create({
    //             groupsSequence:[groupId]
    //         })
    //         return {success : true , rule}
    //     }
    //     if(rule.groupsSequence.some( g=> g.toString() === groupId)){
    //         return {success: false, message : "group already in the complaint groups sequence"}
    //     }else {
    //         rule.groupsSequence.push(new Types.ObjectId(groupId));
            
    //         await rule.save();
            
    //         rule = await rule.populate("groupsSequence")
    //         const ruleId = (rule._id as Types.ObjectId).toString()
    //         await this.logsService.logAction(user , "Edit-Rule" , "Rule" , ruleId , `The User Has Added Group ${group.name} from Rule`)
        
    //         return {success : true , rule , groupsSequence : rule.groupsSequence}
    //     }


    // }

    async addGroupToRule(userId: string, groupId: string) {
        const userIdNum = Number(userId);
        const groupIdNum = Number(groupId);
        if (isNaN(groupIdNum) || isNaN(userIdNum)) {
            throw new BadRequestException("Invalid groupId or userId");
        }

        // Find user
        const user = await this.userRepo.findOne({ where: { user_id: userIdNum } });
        if (!user) throw new NotFoundException("user not found");
        
        // Find group
        const group = await this.groupRepo.findOne({ where: { group_id: groupIdNum } });
        if (!group) throw new NotFoundException("group not found");
        
        // Find existing rule (assuming single rule)
        let rule = await this.complaintGroupsRuleRepo.findOne({
            where :{},
            relations: ['groups']
        });
        
        if (!rule) {
            rule = this.complaintGroupsRuleRepo.create({ groups: [group] });
            await this.complaintGroupsRuleRepo.save(rule);
            return { success: true, rule };
        }
        
        if (rule.groups.some(g => g.group_id === groupIdNum)) {
            return { success: false, message: "group already in the complaint groups sequence" };
        }

        // Add group to rule
        rule.groups.push(group);
        await this.complaintGroupsRuleRepo.save(rule);

        await this.logsService.logAction(
            user,
            "Edit-Rule",
            "Rule",
            rule.id,
            `The User Has Added Group ${group.group_name} to the Rule`
        );

        return { success: true, rule, groupsSequence: rule.groups };
    }


    // async removeGroupFromRule(id : string , groupId : string){
    //     if(!isValidObjectId(groupId) || !isValidObjectId(id))
    //         throw new BadRequestException("invalid id ")
    //     const user = await this.userModel.findById(id);
    //     if(!user)
    //         throw new NotFoundException("user not found ")

    //     const group = await this.groupModel.findById(groupId)
    //     if(!group)
    //         throw new NotFoundException("group not found ")

    //     let rule = await this.complaintGroupsRule.findOne({groupsSequence:groupId})
    //     if(!rule)
    //         throw new NotFoundException("rule not found")

    //     rule.groupsSequence = rule.groupsSequence.filter((g)=> g.toString() !== groupId.toString())

    //     await rule.save()
    //     rule = await rule.populate("groupsSequence")
    //     const ruleId = (rule._id as Types.ObjectId).toString()
    //     await this.logsService.logAction(user , "Edit-Rule" , "Rule" , ruleId , `The User Has Removed Group ${group.name} from Rule`)

    //     return {success : true , rule , groupsSequence : rule.groupsSequence}
    // }

    async removeGroupFromRule(id : string , groupId : string){
        const groupIdNum = Number(groupId)
        const userIdNum = Number(id)

        const user = await this.userRepo.findOne({
            where : {user_id : userIdNum}
        })
        if (!user) throw new NotFoundException("user not found");

        const group = await this.groupRepo.findOne({ where: { group_id: groupIdNum } });
        if (!group) throw new NotFoundException("group not found");

        // const rule = await this.complaintGroupsRuleRepo
        //     .createQueryBuilder("complaint_groups_rule")
        //     .leftJoinAndSelect("complaint_groups_rule.groups", "group_entity")
        //     .where("group_entity.group_id = :groupId", { groupId: groupIdNum })
        //     .getOne();

        const rule = await this.complaintGroupsRuleRepo.findOne({
            where: { groups: { group_id: groupIdNum } },
            relations: ["groups"]
        })
        
        if(!rule)
            throw new NotFoundException("rule not found")

        rule.groups = rule.groups.filter( g => g.group_id !== groupIdNum)
        await this.complaintGroupsRuleRepo.save(rule)

        await this.logsService.logAction(
            user,
            "Edit-Rule",
            "Rule",
            rule.id,
            `The User Has Removed Group ${group.group_name} from Rule`
        );



        return {success : true , rule , groupsSequence : rule.groups}
    }



    // async getRules(){
    //     const rule = await this.complaintGroupsRule.findOne().populate("groupsSequence" , "-users")
    //     return { success: true, rule }
    // }

    async getRules() {
        const rules = await this.complaintGroupsRuleRepo.find({
            relations: ['groups', 'groups.users'],
            take: 1,
        });
        const rule = rules[0];

        if (rule?.groups) {
            rule.groups.forEach(group => {
                group.users = group.users.map(user => {
                    const { user_password, ...rest } = user as any;
                    return rest;
                });
            });
        }

        return { success: true, rule };
    }

}
