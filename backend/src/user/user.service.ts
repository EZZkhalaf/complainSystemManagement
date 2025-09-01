import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { ChangeUserRoleDto } from './dtos/change-user-role.dto';
import { AddUserToGroupDto } from './dtos/add-user-to-group.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';
import { AdminEditUserInfoDto } from './dtos/admin-edit-user-info.dto';
import { LogsService } from '../logs/logs.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Between, IsNull, Repository } from 'typeorm';
import { RolesEntity } from '../roles/entities/roles.entity';
import { GroupEntity } from '../groups/entities/group.entity';
import { ComplaintEntity } from '../complaint/entities/complaint.entity';
import { plainToInstance } from 'class-transformer';
import { UserOutputDto } from './dtos/user-output.dto';
import { ComplaintOutputDto } from '../complaint/dtos/complaint-output.dto';
import { LeavesEntity, LeaveStatus } from '../leaves/entities/leaves.entity';

export interface UserWithRole {
  user: any;
  role: string;
}
@Injectable()
export class UserService {
  constructor(
    private readonly logsService: LogsService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RolesEntity)
    private readonly rolesRepo: Repository<RolesEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,
    @InjectRepository(ComplaintEntity)
    private readonly complaintRepo: Repository<ComplaintEntity>,
    @InjectRepository(LeavesEntity)
    private readonly leaveRepo: Repository<LeavesEntity>,
  ) {}

  async changeUserRole(dto: ChangeUserRoleDto) {
    const { userId, newRole } = dto;

    const userIdNumber = Number(userId);
    const user = await this.userRepo.findOne({
      where: { user_id: userIdNumber },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.rolesRepo.find({
      relations: ['users'],
      where: {
        users: { user_id: userIdNumber },
      },
    });

    for (const role of roles) {
      role.users = role.users.filter((u) => u.user_id !== userIdNumber);
      await this.rolesRepo.save(role);
    }

    // Find new role
    const newRoleEntity = await this.rolesRepo.findOne({
      where: { role_name: newRole },
      relations: ['users'],
    });
    if (!newRoleEntity) {
      throw new NotFoundException('Role not found');
    }

    // Add user to new role if not already present
    if (!newRoleEntity.users.some((u) => u.user_id === userIdNumber)) {
      newRoleEntity.users.push(user);
      await this.rolesRepo.save(newRoleEntity);
    }

    await this.logsService.logAction(
      user,
      'Role',
      'User',
      user.user_id,
      `Changed The User Role to ${newRoleEntity.role_name}`,
    );

    return {
      success: true,
      message: 'User role updated successfully',
      role: newRoleEntity,
    };
  }

  async fetchUsers() {
    const rolesWithUsers = await this.rolesRepo.find({
      relations: ['users'],
    });
    const nonAdminUsers = rolesWithUsers
      .filter((role) => role.role_name !== 'admin' && role.users)
      .map((role) => ({
        users: role.users,
        role: role.role_name,
        roleId: role.role_id,
      }));

    const roles = await this.rolesRepo.find();
    return {
      success: true,
      users: nonAdminUsers,
      roles2: roles,
    };
  }

  async fetchUsersRoleEdition() {
    const roles = await this.rolesRepo.find({
      relations: {
        users: true,
      },
      select: {
        users: {
          user_id: true,
          user_name: true,
          user_email: true,
          profilePicture: true,
          user_password: false,
        },
        role_name: true,
        role_id: true,
      },
    });

    // Map users with roles
    let usersWithRoles: UserWithRole[] = [];
    roles.forEach((role) => {
      role?.users?.forEach((user) => {
        usersWithRoles.push({
          user,
          role: role.role_name,
        });
      });
    });
    const roles2 = roles.map(({ permissions, ...rest }) => rest);
    return {
      success: true,
      users: usersWithRoles,
      roles2,
    };
  }

  async addUserToGroup(dto: AddUserToGroupDto) {
    const { groupId, userId } = dto;
    const group = await this.groupRepo.findOne({
      where: { group_id: Number(groupId) },
      relations: ['users'],
      select: {
        users: {
          user_id: true,
          user_name: true,
          user_email: true,
          profilePicture: true,
          user_password: false,
        },
      },
    });
    if (!group) throw new NotFoundException('group not found');

    const user = await this.userRepo.findOne({
      where: { user_id: Number(userId) },
    });
    if (!user) throw new NotFoundException('user not found');

    if (group.users.some((u) => u.user_id === user.user_id))
      throw new BadRequestException('user already in the group');
    group.users.push(user);
    await this.groupRepo.save(group);
    await this.logsService.logAction(
      user,
      'Add-User',
      'Group',
      group.group_id,
      `Has Been Added to Group ${group.group_name}`,
    );
    return {
      success: true,
      message: 'User added to group successfully',
      group: group,
    };
  }

  async getSummary(id: string) {
    const usersCount = await this.userRepo.count();
    const groupsCount = await this.groupRepo.count();
    const complaintsCount = await this.complaintRepo.count();

    return {
      success: true,
      users: usersCount,
      groups: groupsCount,
      complaints: complaintsCount,
    };
  }

  async getSummaryCharts(id: string) {
    const complaintsPerCategory = await this.complaintRepo
      .createQueryBuilder('complaint_info')
      .select('complaint_info.complaint_type', 'complaint_type')
      .addSelect('COUNT(*)', 'total')
      .groupBy('complaint_info.complaint_type')
      .getRawMany();

    const commontComplaintsTypes = await this.complaintRepo
      .createQueryBuilder('complaint_info')
      .select('complaint_info.complaint_type', 'complaint_type')
      .addSelect('COUNT(*)', 'total')
      .groupBy('complaint_info.complaint_type')
      .orderBy('total', 'DESC')
      .getRawMany();

    if (!commontComplaintsTypes) {
      throw new NotFoundException(
        'error getting the summary of the complaints',
      );
    }

    return {
      success: true,
      complaintsPerCategory,
      commontComplaintsTypes,
    };
  }

  async getLeavesSummaryChartMonthly(userId: string) {
    if (isNaN(Number(userId)))
      throw new BadRequestException('user id is invalid');

    const user = await this.userRepo.findOne({
      where: { user_id: Number(userId) },
      select: ['user_email', 'user_name', 'user_id'],
    });
    if (!user) throw new NotFoundException('user not found');

    const now = new Date();
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfLastMonth = new Date();
    const totalLeaves = await this.leaveRepo.count({
      where: { leave_user: { user_id: Number(userId) } },
    });
    const acceptedLeaves = await this.leaveRepo.count({
      where: {
        leave_user: { user_id: Number(userId) },
        leave_status: 'accepted' as LeaveStatus,
        created_at: Between(firstDayOfLastMonth, lastDayOfLastMonth),
      },
    });

    const rejectedLeaves = await this.leaveRepo.count({
      where: {
        leave_user: { user_id: Number(userId) },
        leave_status: LeaveStatus.REJECTED,
        created_at: Between(firstDayOfLastMonth, lastDayOfLastMonth),
      },
    });
    const pendingLeaves = await this.leaveRepo.count({
      where: {
        leave_user: { user_id: Number(userId) },
        leave_status: LeaveStatus.PENDING,
        created_at: Between(firstDayOfLastMonth, lastDayOfLastMonth),
      },
    });
    const handeledLeaves = await this.leaveRepo.count({
      where: {
        leave_handler: { user_id: Number(userId) },
        created_at: Between(firstDayOfLastMonth, lastDayOfLastMonth),
      },
    });

    return {
      success: true,
      totalLeaves,
      acceptedLeaves,
      rejectedLeaves,
      handeledLeaves,
      pendingLeaves,
    };
  }

  async editUserInfo(
    id: string,
    body: any,
    file: Express.Multer.File,
    currentUser: any,
  ) {
    const { newName, newEmail, oldPassword, newPassword } = body;
    let imagePath = file ? `/uploads/${file.filename}` : null;

    const user = await this.userRepo.findOne({
      where: { user_id: Number(id) },
      select: {
        user_email: true,
        user_name: true,
        user_password: true,
        user_id: true,
        user_role: {
          role_id: true,
          role_name: true,
          users: false,
          permissions: false,
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const correctPassword = await bcrypt.compare(
      oldPassword,
      user.user_password,
    );
    if (!correctPassword)
      throw new UnauthorizedException('old password is incorrect');

    const newHashPassword = await bcrypt.hash(newPassword, 10);

    if (newEmail && newEmail !== user.user_email) {
      const emailExists = await this.userRepo.findOne({
        where: { user_email: newEmail },
      });
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

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'jsonwebtoken',
        {
          expiresIn: '1h',
        },
      );

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

    user.user_name = newName;
    user.user_email = newEmail;
    user.user_password = newHashPassword;
    if (imagePath) user.profilePicture = imagePath;

    await this.userRepo.save(user);

    const updatedUser = await this.userRepo.findOne({
      where: { user_id: Number(id) },
    });

    const role = await this.rolesRepo.findOne({
      where: { users: { user_id: Number(id) } },
    });

    //edit service
    return {
      success: true,
      newUser: {
        _id: updatedUser?.user_id,
        name: updatedUser?.user_name,
        email: updatedUser?.user_email,
        role: role?.role_name,
        profilePicture: updatedUser?.profilePicture,
      },
    };
  }

  async adminEditUserInfo(id: string, dto: AdminEditUserInfoDto) {
    const { userId, newName, newEmail, newPassword } = dto;
    // const adminRole = await this.rolesRepo.findOne({
    //     where : {users :{
    //         user_id : Number(userId)
    //     }},
    //     relations : ['users']
    // })

    // if (!adminRole || adminRole.role_name !== 'admin') {
    //     throw new HttpException('Only the admin can edit user info', HttpStatus.UNAUTHORIZED);
    // }
    const targetUser = await this.userRepo.findOne({
      where: { user_id: Number(userId) },
    });
    if (!targetUser) throw new NotFoundException('user not found');

    if (newName !== undefined) targetUser.user_name = newName;
    if (newEmail !== undefined) targetUser.user_email = newEmail;
    if (newPassword !== undefined) {
      targetUser.user_password = await bcrypt.hash(newPassword, 10);
    }

    await this.userRepo.save(targetUser);

    const { user_password, ...safeUser } = targetUser;

    return {
      success: true,
      message: 'User updated successfully',
      updatedUser: safeUser,
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findOne({
      where: { user_id: Number(id) },
    });

    if (!user) throw new NotFoundException('user not found');

    const role = await this.rolesRepo.findOne({
      where: { users: { user_id: Number(id) } },
    });
    if (!role) throw new NotFoundException('role  not found');

    const groups = await this.groupRepo
      .createQueryBuilder('group')
      .leftJoin('group.users', 'user_info')
      .where('user_info.user_id = :id', { id: Number(id) })
      .select([
        'group.group_id',
        'group.group_name',
        'user_info.user_id',
        'user_info.user_name',
      ])
      .getMany();

    const complaints = await this.complaintRepo.find({
      where: { creator_user: { user_id: Number(id) } },
    });

    return {
      success: true,
      user: plainToInstance(UserOutputDto, user, {
        excludeExtraneousValues: true,
      }), // only the populated user object
      role: role.role_name,
      groups,
      complaints: plainToInstance(ComplaintOutputDto, complaints, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async verifyEmailUpdate(token: string): Promise<string> {
    if (!token)
      throw new HttpException('no token provided', HttpStatus.BAD_REQUEST);
    let decoded: any;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'jsonwebtokensecret',
      );
    } catch (error) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { _id, newName, newEmail, newHashPassword, imagePath } = decoded;
    const userBeforeUpdate = await this.userRepo.findOne({
      where: { user_id: Number(_id) },
    });
    if (!userBeforeUpdate)
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);

    const oldEmail = userBeforeUpdate.user_email;

    await this.userRepo.update(_id, {
      ...(newName && { user_name: newName }),
      ...(newEmail && { user_email: newEmail }),
      ...(newHashPassword && { user_password: newHashPassword }),
      ...(imagePath && { profilePicture: imagePath }),
    });

    return `http://localhost:5173/email-verified?token=${token}`;
  }

  async deleteUser(userId: string) {
    const user = await this.userRepo.findOne({
      where: { user_id: Number(userId) },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.rolesRepo
      .createQueryBuilder('role_info')
      .relation(RolesEntity, 'users')
      .of(user)
      .remove(user);

    await this.userRepo.delete(Number(userId));

    return {
      success: true,
      message: 'User and associated data deleted successfully.',
    };
  }
}
