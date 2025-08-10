import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException, Type, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Group, GroupDocument } from 'src/groups/schemas/group.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { ChangeUserRoleDto } from './dtos/change-user-role.dto';
import { AddUserToGroupDto } from './dtos/add-user-to-group.dto';
import { Complaint, ComplaintDocument } from 'src/complaint/schemas/complaint.schema';
import * as bcrypt from 'bcrypt'
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';
import { AdminEditUserInfoDto } from './dtos/admin-edit-user-info.dto';
import { LogsService } from 'src/logs/logs.service';

export interface UserWithRole {
        user: any; 
        role: string;
    }
@Injectable()
export class UserService {
    constructor(
        private readonly logsService : LogsService,
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

    async editUserInfo(
        id : string ,
        body : any ,
        file : Express.Multer.File,
        currentUser : any
    ){
        const { newName, newEmail, oldPassword, newPassword } = body;
        let imagePath = file ? `/uploads/${file.filename}` : null ;

        const user = await this.userModel.findById(id);
        if (!user) throw new NotFoundException('User not found');

        const correctPassword = await bcrypt.compare(oldPassword , user.password);
        if(!correctPassword)
            throw new UnauthorizedException("old password is incorrect")

        const newHashPassword = await bcrypt.hash(newPassword , 10)

        if (newEmail && newEmail !== user.email) {
            const emailExists = await this.userModel.findOne({ email: newEmail });
            if (emailExists) throw new BadRequestException('Email already taken');

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: Number(process.env.EMAIL_PORT),
                secure: false,
                auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
                },
            });

            const payload: any = {
                _id: id,
                newName,
                newEmail,
                newHashPassword,
            };
            if (imagePath) payload.imagePath = imagePath;

            const token = jwt.sign(payload, process.env.JWT_SECRET || "jsonwebtoken", {
                expiresIn: '1h',
            });

            const verificationLink = `http://localhost:5000/api/user/verify-email?token=${token}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: newEmail,
                subject: 'Verify your email',
                html: `
                <h2>Welcome, ${newName}!</h2>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationLink}">${verificationLink}</a>
                <p>This link will expire in 1 hour.</p>
                `,
            });

            return { success: true, message: 'Verification link sent to new email' };
            }

            await this.userModel.findByIdAndUpdate(id, {
                name: newName,
                email: newEmail,
                password: newHashPassword,
                profilePicture: imagePath,
            });

            const updatedUser = await this.userModel.findById(id);
            const role = await this.roleModel.findOne({ user: id });
            const updatedUserId = (updatedUser?._id as Types.ObjectId).toString()
            await this.logsService.logAction(
                updatedUser,
                'User-Info',
                'User',
                updatedUserId,
                'Changed user info (name/email/password)',
            );

            //edit service
            return {
                success: true,
                newUser: {
                    _id: updatedUser?._id,
                    name: updatedUser?.name,
                    email: updatedUser?.email,
                    role: role?.role,
                    profilePicture: updatedUser?.profilePicture,
                },
            };

            
    }
    

    async adminEditUserInfo(id:string , dto : AdminEditUserInfoDto ){
            const { userId, newName, newEmail, newPassword } = dto;

            // Check if admin
            const isAdmin = await this.roleModel.findOne({ user: id });
            if (!isAdmin || isAdmin.role !== 'admin') {
            throw new HttpException(
                'Only the admin can edit user info',
                HttpStatus.UNAUTHORIZED,
            );
            }

            // Find the user to update
            const user = await this.userModel.findById(userId);
            if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            // Prepare update object
            const updatedFields: Partial<typeof user> = {
            name: newName,
            email: newEmail,
            };

            if (newPassword) {
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            updatedFields.password = newHashedPassword;
            }

            // Update user
            await this.userModel.findByIdAndUpdate(userId, updatedFields);

            const empUser = await this.userModel.findById(userId);
            const updatedUser = await this.userModel.findById(userId).select('-password');
            const updatedUserId = (updatedUser?._id as Types.ObjectId).toString()
            // Log the action (assuming logAction accepts these params)
            await this.logsService.logAction(
            isAdmin,
            'Change-Info',
            'User',
            updatedUserId,
            `Changed the user ${empUser?.name} information`,
            );

            return {
            success: true,
            message: 'User updated successfully',
            updatedUser,
            };
    }

    async getUserById(id : string){
        if(!isValidObjectId(id))
            throw new BadRequestException("id is not valid")

        const user = await this.userModel.findById(id);

        const role = await this.roleModel.findOne({user : id});
        if(!role)
            throw new NotFoundException("user not found")

        const groups = await this.groupModel.find({users : id})
        const complaints = await this.complaintModel.find({userId : id})

        return {
            success: true,
            user: user,     // only the populated user object
            role: role.role,     // role string (if needed)
            groups,
            complaints,
        }
    }

    async verifyEmailUpdate(token : string) : Promise<string>{
        if(!token)
            throw new HttpException("no token provided" , HttpStatus.BAD_REQUEST)
        let decoded :any;

        try {
            decoded = jwt.verify(token , process.env.JWT_SECRET || 'jsonwebtokensecret')
        } catch (error) {
            throw new HttpException('Invalid or expired token', HttpStatus.BAD_REQUEST);
        }

        const { _id, newName, newEmail, newHashPassword, imagePath } = decoded;
        const userBeforeUpdate = await this.userModel.findById(_id)
        if(!userBeforeUpdate)
            throw new HttpException("user not found" , HttpStatus.BAD_REQUEST)

        const oldEmail = userBeforeUpdate.email ;

        await this.userModel.findByIdAndUpdate(_id , {
            name : newName ,
            email : newEmail ,
            password : newHashPassword ,
            ...(imagePath && {profilePicture : imagePath})
        })

        const user = await this.userModel.findById(_id)
        const userId = (user?._id as Types.ObjectId).toString()
        await this.logsService.logAction(
            user,
            'User-Info',
            'User',
            userId,
            `Changed His User Email from ${oldEmail} to ${user?.email}`,
        );

        return `http://localhost:5173/email-verified?token=${token}`;
    }

    async deleteUser(userId : string){
        if(!isValidObjectId(userId))
            throw new BadRequestException("invallid user id ")

        const user = await this.userModel.findByIdAndDelete(userId);

        await this.complaintModel.deleteMany({userId : userId})
        await this.roleModel.updateMany({user : userId} , {$pull : {user : userId}})
        await this.logsService.logAction(
            user,
            'User-Delete',
            'User',
            userId,
            `the user has deleted his account`,
        );
        return { success: true, message: 'User and associated data deleted successfully.' }
    }
}
