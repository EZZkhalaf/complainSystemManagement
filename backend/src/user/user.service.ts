import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from 'src/groups/schemas/group.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { ChangeUserRoleDto } from './dtos/change-user-role.dto';
import { AddUserToGroupDto } from './dtos/add-user-to-group.dto';
import { Complaint, ComplaintDocument } from 'src/complaint/schemas/complaint.schema';


export interface UserWithRole {
        user: any; // or better use your UserDocument or user type
        role: string;
    }
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel  :Model<UserDocument> ,
        @InjectModel(Group.name) private groupModel : Model<GroupDocument>,
        @InjectModel(Role.name) private roleModel : Model<RoleDocument> ,
        @InjectModel(Complaint.name) private complaintModel : Model<ComplaintDocument>
    ){}


    async changeUserRole(dto : ChangeUserRoleDto){
        try{
            const { userId, newRole } = dto;

            const objectUserId = new Types.ObjectId(userId)
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Remove user from all roles that include them
            await this.roleModel.updateMany(
                { user: userId },
                { $pull: { user: userId } },
            );

            // Find new role
            const role = await this.roleModel.findOne({ role: newRole });
            if (!role) {
                throw new NotFoundException('Role not found');
            }

            // Add user to new role if not already present
            if (!role.user.includes(objectUserId)) {
                role.user.push(objectUserId);
                await role.save();
            }

            // await logAction(
            //     user,
            //     'Role',
            //     'User',
            //     user._id,
            //     `Changed The User Role to ${role.role}`,
            // );

            return {
                success: true,
                message: 'User role updated successfully',
                role,
            };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Server error');
        }
    }

    async fetchUsers(){
        try{
            const rolesWithUsers = await this.roleModel.find().populate("user" , '-password')

            const nonAdminUsers = rolesWithUsers
                .filter( role => role.role !== "admin" && role.user)
                .map( role => ({
                    user : role.user ,
                    role : role.role ,
                    roleId : role._id
                }))

                const roles = await this.roleModel.find()
                return {
                    success: true,
                    users: nonAdminUsers,
                    roles2: roles
                }
            } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Server error');
        }
    }

    
    async fetchUsersRoleEdition(){
        try{
            const roles = await this.roleModel.find().populate('user', '-password');

            // Map users with roles
            let usersWithRoles : UserWithRole[] = []
            roles.forEach(role => {
                role?.user?.forEach(user => {
                    usersWithRoles.push({
                    user,
                    role: role.role
                    });
                });
            });
            const roles2 = await this.roleModel.find().select("-permissions");

            return {
                success: true,
                users: usersWithRoles , 
                roles2
            }
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Server error');
        }
    }

    async addUserToGroup(dto : AddUserToGroupDto){
        try{
            const {groupId , userId} = dto;

            const objectIdUser = new Types.ObjectId(userId)
            const group = await this.groupModel.findById(groupId)
            if(!group)
                throw new NotFoundException("group not found")
            const user = await this.userModel.findById(userId);
            if(!user)
                throw new NotFoundException("user not found")

            if(group.users.includes(objectIdUser))
                throw new BadRequestException("user already in the group")
            group.users.push(objectIdUser)
            await group.save()
            // await logAction(user , "Add-User" , "Group" , group._id , `Has Been Added to Group ${group.name}`)
            return { success : true , message: 'User added to group successfully', group: group }
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Server error');
        }


    }

    async getSummary(id : string){
        try {
            const userRole = await this.roleModel.findOne({ user: id });

            if (!userRole || userRole.role !== 'admin') {
                throw new UnauthorizedException('Only the admin can get the system summary');
            }

            const usersCount = await this.userModel.countDocuments();
            const groupsCount = await this.groupModel.countDocuments();
            const complaintsCount = await this.complaintModel.countDocuments();

            return {
                success: true,
                users: usersCount,
                groups: groupsCount,
                complaints: complaintsCount,
        };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Server error');
        }
    }
}
