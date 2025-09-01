import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { CreateGroupDto } from './dtos/create-group.dto';
import { RemoveUserFromGroupDto } from './dtos/remove-user-from-group.dto';
import { ListGroupComplaintsDto } from './dtos/list-group-complaints.dto';
import { LogsService } from '../logs/logs.service';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ComplaintEntity } from '../complaint/entities/complaint.entity';
import { ComplaintGroupsRuleEntity } from '../complaint/entities/complaint-groups-rule.entity';
import { plainToInstance } from 'class-transformer';
import { GroupOutputDto } from './dtos/group-output.dto';

@Injectable()
export class GroupsService {
  constructor(
    private readonly logsService: LogsService,
    @InjectRepository(GroupEntity) private groupRepo: Repository<GroupEntity>,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(ComplaintEntity)
    private complaintRepo: Repository<ComplaintEntity>,
    @InjectRepository(ComplaintGroupsRuleEntity)
    private complaintGroupsRuleRepo: Repository<ComplaintGroupsRuleEntity>,
  ) {}

  async createGroup(userId: string, dto: CreateGroupDto) {
    const { name, description } = dto;

    const nameExists = await this.groupRepo.findOne({
      where: { group_name: name },
    });
    if (nameExists) {
      throw new BadRequestException('Group name already exists');
    }

    const user = await this.userRepo.findOne({
      where: { user_id: Number(userId) },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newGroup = this.groupRepo.create({
      group_name: name,
      users: [user],
    });

    await this.groupRepo.save(newGroup);

    await this.logsService.logAction(
      user,
      'Create-Group',
      'Group',
      newGroup.group_id,
      `Created the Group called : (${newGroup.group_name})`,
    );
    return {
      success: true,
      message: 'Group created successfully',
      group: newGroup,
    };
  }

  async removeUserFomeGroup(dto: RemoveUserFromGroupDto) {
    const { groupId, userId } = dto;

    const group = await this.groupRepo.findOne({
      where: { group_id: groupId },
      relations: ['users'],
    });
    if (!group) throw new NotFoundException('Group not found');

    const user = await this.userRepo.findOne({
      where: { user_id: Number(userId) },
    });
    if (!user) throw new NotFoundException('user not found');

    if (!group.users.some((user) => user.user_id === userId))
      throw new BadRequestException('user is not in the group  to remove');

    group.users = group.users.filter((user) => user.user_id !== userId);
    await this.groupRepo.save(group);
    await this.logsService.logAction(
      user,
      'Remove-User',
      'Group',
      group.group_id,
      `Has Been Removed From Group ${group.group_name}`,
    );
    return {
      success: true,
      message: 'User removed from group successfully',
      group,
    };
  }

  async getGroupInfoAndUsers(groupId: string) {
    const group = await this.groupRepo.findOne({
      where: { group_id: Number(groupId) },
      relations: ['users'],
    });

    if (!group) throw new NotFoundException('group not found');

    return {
      success: true,
      group: plainToInstance(GroupOutputDto, group, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async deleteGroup(user: any, groupId: string) {
    const groupIdNum = Number(groupId);

    const group = await this.groupRepo.findOne({
      where: { group_id: groupIdNum },
      relations: { complaintGroupsRules: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    for (const rule of group.complaintGroupsRules) {
      await this.complaintGroupsRuleRepo
        .createQueryBuilder()
        .relation(ComplaintGroupsRuleEntity, 'groups')
        .of(rule.id)
        .remove(groupIdNum);
    }

    await this.groupRepo.remove(group);

    await this.logsService.logAction(
      user,
      'Delete-Group',
      'Group',
      group.group_id,
      `Has Deleted The Group ${group.group_name}`,
    );

    return { success: true, message: 'Group deleted successfully' };
  }

  async getUserGroups(userId: string) {
    const user = await this.userRepo.findOne({
      where: { user_id: Number(userId) },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const groups = await this.groupRepo.find({
      where: { users: { user_id: Number(userId) } },
      relations: ['users'],
      select: {
        group_id: true,

        group_name: true,
        users: {
          user_id: true,
          user_name: true,
          user_email: true,
          user_password: false,
        },
      },
    });
    return {
      success: true,
      groups: plainToInstance(GroupOutputDto, groups, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async listGroups(id: string) {
    const groups = await this.groupRepo.find({
      relations: ['users'],
      select: {
        group_id: true,
        group_name: true,
        users: {
          user_id: true,
          user_name: true,
          user_email: true,
          user_password: false,
          profilePicture: false,
        },
      },
    });
    return { success: true, groups };
  }

  async listGroupComplaints(groupId: string, dto: ListGroupComplaintsDto) {
    const { userId, type, status, page, limit } = dto;

    const groupIdNum = Number(groupId);
    const userIdNum = Number(userId);

    const group = await this.groupRepo.findOne({
      where: { group_id: groupIdNum },
      relations: ['users'],
    });

    if (!group) throw new NotFoundException('group not found');

    const inTheGroup = group.users.some((u) => u.user_id === userIdNum);
    if (!inTheGroup) {
      throw new ForbiddenException(
        'User is not allowed to view other groups complaints',
      );
    }

    const [complaints, total] = await this.complaintRepo
      .createQueryBuilder('complaint_info')
      .innerJoin('complaint_info.groupsQueue', 'group_entity')
      .where('group_entity.group_id = :groupId', { groupId: groupIdNum })
      .andWhere(type ? 'complaint_info.complaint_type = :type' : '1=1', {
        type,
      })
      .andWhere(status ? 'complaint_info.complaint_status = :status' : '1=1', {
        status,
      })
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

  async searchGroups(search: string) {
    const groups = await this.groupRepo
      .createQueryBuilder('group_entity')
      .where('group_entity.group_name ILIKE :search', { search: `%${search}%` })
      .getMany();

    return { success: true, groups };
  }

  async addGroupToRule(userId: string, groupId: string) {
    const userIdNum = Number(userId);
    const groupIdNum = Number(groupId);
    if (isNaN(groupIdNum) || isNaN(userIdNum)) {
      throw new BadRequestException('Invalid groupId or userId');
    }

    // Find user
    const user = await this.userRepo.findOne({ where: { user_id: userIdNum } });
    if (!user) throw new NotFoundException('user not found');

    // Find group
    const group = await this.groupRepo.findOne({
      where: { group_id: groupIdNum },
    });
    if (!group) throw new NotFoundException('group not found');

    // Find existing rule (assuming single rule)
    let rule = await this.complaintGroupsRuleRepo.findOne({
      where: {},
      relations: ['groups'],
    });

    if (!rule) {
      rule = this.complaintGroupsRuleRepo.create({ groups: [group] });
      await this.complaintGroupsRuleRepo.save(rule);
      return { success: true, rule };
    }

    if (rule.groups.some((g) => g.group_id === groupIdNum)) {
      return {
        success: false,
        message: 'group already in the complaint groups sequence',
      };
    }

    // Add group to rule
    rule.groups.push(group);
    await this.complaintGroupsRuleRepo.save(rule);

    await this.logsService.logAction(
      user,
      'Edit-Rule',
      'Rule',
      rule.id,
      `The User Has Added Group ${group.group_name} to the Rule`,
    );

    return { success: true, rule, groupsSequence: rule.groups };
  }

  async removeGroupFromRule(id: string, groupId: string) {
    const groupIdNum = Number(groupId);
    const userIdNum = Number(id);

    const user = await this.userRepo.findOne({
      where: { user_id: userIdNum },
    });
    if (!user) throw new NotFoundException('user not found');

    const group = await this.groupRepo.findOne({
      where: { group_id: groupIdNum },
    });
    if (!group) throw new NotFoundException('group not found');

    const rule = await this.complaintGroupsRuleRepo.findOne({
      where: { groups: { group_id: groupIdNum } },
      relations: ['groups'],
    });

    if (!rule) throw new NotFoundException('rule not found');

    rule.groups = rule.groups.filter((g) => g.group_id !== groupIdNum);
    await this.complaintGroupsRuleRepo.save(rule);

    await this.logsService.logAction(
      user,
      'Edit-Rule',
      'Rule',
      rule.id,
      `The User Has Removed Group ${group.group_name} from Rule`,
    );

    return { success: true, rule, groupsSequence: rule.groups };
  }

  async getRules() {
    const rules = await this.complaintGroupsRuleRepo.find({
      relations: ['groups', 'groups.users'],
      take: 1,
    });
    const rule = rules[0];

    if (rule?.groups) {
      rule.groups.forEach((group) => {
        group.users = group.users.map((user) => {
          const { user_password, ...rest } = user as any;
          return rest;
        });
      });
    }

    return { success: true, rule };
  }
}
