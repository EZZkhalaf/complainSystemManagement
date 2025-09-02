import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ComplaintEntity } from '../complaint/entities/complaint.entity';
import { RolesEntity } from '../roles/entities/roles.entity';
import { ComplaintGroupsRuleEntity } from '../complaint/entities/complaint-groups-rule.entity';
import { GroupEntity } from '../groups/entities/group.entity';
import { LogsService } from '../logs/logs.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as EmailUtils from '../utils/email.util';
import * as EmailUtils2 from '../utils/send-complaints-email.util';

jest.mock('nodemailer', () => {
  const sendMail = jest.fn();
  return {
    __esModule: true,
    createTransport: jest.fn().mockReturnValue({
      sendMail,
    }),
    __mockedSendMail: sendMail,
  };
});

import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';
import { UserOutputDto } from './dtos/user-output.dto';
import { plainToInstance } from 'class-transformer';
import { ComplaintOutputDto } from '../complaint/dtos/complaint-output.dto';
import { LeavesEntity, LeaveStatus } from '../leaves/entities/leaves.entity';
import { Between } from 'typeorm';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;

  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };
  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    jest.spyOn(EmailUtils2, 'sendComplaintEmail').mockResolvedValue(undefined);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('UserService - changeUserRole', () => {
  let service: UserService;
  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },

        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should throw not found error when the user not found', async () => {
    const dto: any = { userId: '1', newRole: 'user' };
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.changeUserRole(dto)).rejects.toThrow(
      new NotFoundException('User not found'),
    );

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(dto.userId) },
    });
  });

  it('should throw not found error when the new role is not found', async () => {
    const dto: any = { userId: '1', newRole: 'user' };
    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
    };

    const fakeRoles = [
      { role_id: 1, role_name: 'first', users: [] },
      { role_id: 2, role_name: 'second', users: [] },
      { role_id: 3, role_name: 'third', users: [] },
    ];

    userRepo.findOne.mockResolvedValue(fakeUser);
    rolesRepo.find.mockResolvedValue(fakeRoles);
    rolesRepo.findOne.mockResolvedValue(null);

    await expect(service.changeUserRole(dto)).rejects.toThrow(
      new NotFoundException('Role not found'),
    );

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(dto.userId) },
    });

    expect(rolesRepo.find).toHaveBeenCalledWith({
      relations: ['users'],
      where: { users: { user_id: Number(dto.userId) } },
    });

    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where: { role_name: dto.newRole },
      relations: ['users'],
    });
  });

  it('should change the user role and save it and then add log for it', async () => {
    const dto: any = { userId: '1', newRole: 'user' };
    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
    };

    const fakeRoles = [
      { role_id: 1, role_name: 'first', users: [] },
      { role_id: 2, role_name: 'second', users: [] },
      { role_id: 3, role_name: 'third', users: [] },
    ];

    const newRole = { role_id: 5, role_name: 'newRole', users: [] };
    const updateRole = { ...newRole, users: [fakeUser] };

    userRepo.findOne.mockResolvedValue(fakeUser);
    rolesRepo.find.mockResolvedValue(fakeRoles);
    rolesRepo.findOne.mockResolvedValue(newRole);
    rolesRepo.save.mockResolvedValue(updateRole);

    const result = await service.changeUserRole(dto);

    expect(result.success).toBe(true);
    expect(result.message).toEqual('User role updated successfully');
    expect(result.role).toEqual(updateRole);

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(dto.userId) },
    });

    expect(rolesRepo.find).toHaveBeenCalledWith({
      relations: ['users'],
      where: { users: { user_id: Number(dto.userId) } },
    });

    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where: { role_name: dto.newRole },
      relations: ['users'],
    });

    expect(rolesRepo.save).toHaveBeenCalledWith(updateRole);

    expect(logsService.logAction).toHaveBeenCalledWith(
      fakeUser,
      'Role',
      'User',
      fakeUser.user_id,
      `Changed The User Role to ${newRole.role_name}`,
    );
  });
});

describe('UserService - get user data', () => {
  let service: UserService;
  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },

        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should return non-admin users grouped by role', async () => {
    const fakeRolesWithUsers = [
      {
        role_id: 1,
        role_name: 'admin',
        users: [{ user_id: 1, user_name: 'Admin' }],
      },
      {
        role_id: 2,
        role_name: 'HR',
        users: [
          { user_id: 2, user_name: 'Ezz' },
          { user_id: 3, user_name: 'Omar' },
        ],
      },
      {
        role_id: 3,
        role_name: 'moderator',
        users: [],
      },
    ];

    rolesRepo.find
      .mockResolvedValueOnce(fakeRolesWithUsers) // first call with relations: ["users"]
      .mockResolvedValueOnce(fakeRolesWithUsers); // second call without relations

    const result = await service.fetchUsers();

    expect(rolesRepo.find).toHaveBeenCalledTimes(2);
    expect(rolesRepo.find).toHaveBeenCalledWith({ relations: ['users'] });

    expect(result).toEqual({
      success: true,
      users: [
        {
          users: [
            { user_id: 2, user_name: 'Ezz' },
            { user_id: 3, user_name: 'Omar' },
          ],
          role: 'HR',
          roleId: 2,
        },
        {
          users: [],
          role: 'moderator',
          roleId: 3,
        },
      ],
      roles2: fakeRolesWithUsers,
    });
  });
  it('should return empty users array if no non-admin roles found', async () => {
    const onlyAdminRole = [
      {
        role_id: 1,
        role_name: 'admin',
        users: [{ user_id: 1, user_name: 'Admin' }],
      },
    ];

    rolesRepo.find
      .mockResolvedValueOnce(onlyAdminRole)
      .mockResolvedValueOnce(onlyAdminRole);

    const result = await service.fetchUsers();

    expect(result.users).toEqual([]);
    expect(result.roles2).toEqual(onlyAdminRole);
  });
  it('should throw error if rolesRepo.find first call didnt work', async () => {
    rolesRepo.find.mockRejectedValueOnce(new Error('DB error'));

    await expect(service.fetchUsers()).rejects.toThrow('DB error');
  });
  it('should throw error if rolesRepo.find second call didnt work', async () => {
    rolesRepo.find
      .mockResolvedValueOnce([{ role_id: 1, role_name: 'HR', users: [] }])
      .mockRejectedValueOnce(new Error('DB error'));

    await expect(service.fetchUsers()).rejects.toThrow('DB error');
  });
});

describe('UserService - get user data role edition', () => {
  let service: UserService;
  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },

        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should return users mapped with their roles', async () => {
    const fakeRoles = [
      {
        role_id: 1,
        role_name: 'HR',
        users: [
          {
            user_id: 1,
            user_name: 'Ezz',
            user_email: 'ezz@test.com',
            profilePicture: 'pic1',
          },
          {
            user_id: 2,
            user_name: 'Omar',
            user_email: 'omar@test.com',
            profilePicture: 'pic2',
          },
        ],
        permissions: [],
      },
      {
        role_id: 2,
        role_name: 'moderator',
        users: [
          {
            user_id: 3,
            user_name: 'Sara',
            user_email: 'sara@test.com',
            profilePicture: 'pic3',
          },
        ],
        permissions: [],
      },
    ];

    rolesRepo.find.mockResolvedValue(fakeRoles);

    const result = await service.fetchUsersRoleEdition();

    expect(rolesRepo.find).toHaveBeenCalledWith({
      relations: { users: true },
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

    expect(result).toEqual({
      success: true,
      users: [
        { user: fakeRoles[0].users[0], role: 'HR' },
        { user: fakeRoles[0].users[1], role: 'HR' },
        { user: fakeRoles[1].users[0], role: 'moderator' },
      ],
      roles2: [
        {
          role_id: 1,
          role_name: 'HR',
          users: fakeRoles[0].users,
        },
        {
          role_id: 2,
          role_name: 'moderator',
          users: fakeRoles[1].users,
        },
      ],
    });
  });
  it('should return empty users array if roles exist but all users arrays are empty', async () => {
    const fakeRoles = [
      { role_id: 1, role_name: 'HR', users: [], permissions: [] },
      { role_id: 2, role_name: 'moderator', users: [], permissions: [] },
    ];

    rolesRepo.find.mockResolvedValue(fakeRoles);

    const result = await service.fetchUsersRoleEdition();

    expect(result.users).toEqual([]);
    expect(result.roles2).toEqual([
      { role_id: 1, role_name: 'HR', users: [] },
      { role_id: 2, role_name: 'moderator', users: [] },
    ]);
  });
  it('should return empty users and roles arrays if no roles found', async () => {
    rolesRepo.find.mockResolvedValue([]);

    const result = await service.fetchUsersRoleEdition();

    expect(result.users).toEqual([]);
    expect(result.roles2).toEqual([]);
  });
  it('should handle missing users property gracefully', async () => {
    const fakeRoles = [
      { role_id: 1, role_name: 'HR', permissions: [] }, // no users field
    ];

    rolesRepo.find.mockResolvedValue(fakeRoles);

    const result = await service.fetchUsersRoleEdition();

    expect(result.users).toEqual([]);
    expect(result.roles2).toEqual([{ role_id: 1, role_name: 'HR' }]);
  });
  it('should throw error if rolesRepo.find fails', async () => {
    rolesRepo.find.mockRejectedValue(new Error('DB error'));

    await expect(service.fetchUsersRoleEdition()).rejects.toThrow('DB error');
  });
});

describe('UserService - add user to group', () => {
  let service: UserService;
  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },

        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should throw not found error when group not found', async () => {
    const dto = { userId: '1', groupId: '1' };

    groupRepo.findOne.mockResolvedValue(null);

    await expect(service.addUserToGroup(dto)).rejects.toThrow(
      new NotFoundException('group not found'),
    );

    expect(groupRepo.findOne).toHaveBeenCalledWith({
      where: { group_id: Number(dto.groupId) },
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
  });
  it('should throw not found error when user not found', async () => {
    const dto = { userId: '1', groupId: '1' };
    const fakeGroup = {
      group_id: 1,
      group_name: 'HR',
      users: [],
    };
    groupRepo.findOne.mockResolvedValue(fakeGroup);
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.addUserToGroup(dto)).rejects.toThrow(
      new NotFoundException('user not found'),
    );

    expect(groupRepo.findOne).toHaveBeenCalledWith({
      where: { group_id: Number(dto.groupId) },
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

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(dto.userId) },
    });
  });
  it('user already in the group', async () => {
    const dto = { userId: '1', groupId: '1' };

    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
    };
    const fakeGroup = {
      gorup_id: 1,
      group_name: 'HR',
      users: [fakeUser],
    };
    groupRepo.findOne.mockResolvedValue(fakeGroup);
    userRepo.findOne.mockResolvedValue(fakeUser);

    await expect(service.addUserToGroup(dto)).rejects.toThrow(
      new BadRequestException('user already in the group'),
    );

    expect(groupRepo.findOne).toHaveBeenCalledWith({
      where: { group_id: Number(dto.groupId) },
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

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(dto.userId) },
    });
  });
  it('add user to the group and save and addd log then return success', async () => {
    const dto = { userId: '1', groupId: '1' };

    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
    };
    const fakeGroup = {
      group_id: 1,
      group_name: 'HR',
      users: [],
    };

    const updatedGroup = {
      ...fakeGroup,
      users: [fakeUser],
    };
    groupRepo.findOne.mockResolvedValue(fakeGroup);
    userRepo.findOne.mockResolvedValue(fakeUser);
    groupRepo.save.mockResolvedValue(updatedGroup);

    const result = await service.addUserToGroup(dto);
    expect(result.success).toBe(true);
    expect(result.message).toEqual('User added to group successfully');
    expect(result.group).toEqual(updatedGroup);

    expect(groupRepo.findOne).toHaveBeenCalledWith({
      where: { group_id: Number(dto.groupId) },
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

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(dto.userId) },
    });
    expect(groupRepo.save).toHaveBeenCalledWith(updatedGroup);

    expect(logsService.logAction).toHaveBeenCalledWith(
      fakeUser,
      'Add-User',
      'Group',
      fakeGroup.group_id,
      `Has Been Added to Group ${fakeGroup.group_name}`,
    );
  });
});

describe('UserService - get system summary', () => {
  let service: UserService;
  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },

        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });
  //get summary
  it('should return system summary with counts', async () => {
    const userId = '1';

    // mock the counts
    userRepo.count.mockResolvedValue(5);
    groupRepo.count.mockResolvedValue(3);
    complaintRepo.count.mockResolvedValue(10);

    const result = await service.getSummary(userId);

    // check returned object
    expect(result).toEqual({
      success: true,
      users: 5,
      groups: 3,
      complaints: 10,
    });

    // check that count methods were called
    expect(userRepo.count).toHaveBeenCalled();
    expect(groupRepo.count).toHaveBeenCalled();
    expect(complaintRepo.count).toHaveBeenCalled();
  });
});

describe('UserService - edit user data', () => {
  let service: UserService;
  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },

        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should throw not found error when the user not found', async () => {
    const id = '1';
    const body: any = {};
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 0,
      filename: 'test.txt',
    };
    const currentUser = {};
    userRepo.findOne.mockResolvedValue(null);

    await expect(
      service.editUserInfo(id, body, file, currentUser),
    ).rejects.toThrow(new NotFoundException('User not found'));

    expect(userRepo.findOne).toHaveBeenCalledWith({
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
  });
  it('should throw bad request error when the password is incorrect', async () => {
    const id = '1';
    const body: any = {
      newName: 'ezz',
      newEmail: 'ezz@gmail.com',
      oldPassword: '654321',
      newPassword: '654321',
    };
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 0,
      filename: 'test.txt',
    };
    const currentUser = {};
    const oldPassword = '123456';
    const hashedPassword = await bcrypt.hash(oldPassword, 10);
    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
      user_password: hashedPassword,
      user_role: {
        role_id: 1,
        role_name: 'admin',
      },
    };
    userRepo.findOne.mockResolvedValue(fakeUser);

    await expect(
      service.editUserInfo(id, body, file, currentUser),
    ).rejects.toThrow(new UnauthorizedException('old password is incorrect'));

    expect(userRepo.findOne).toHaveBeenCalledWith({
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
  });
  it('when the email changes and the new email allready taken by anotherr user in the system ,throw new error ', async () => {
    const id = '1';
    const body: any = {
      newName: 'ezz',
      newEmail: 'ezz2@gmail.com',
      oldPassword: '654321',
      newPassword: '654321',
    };
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 0,
      filename: 'test.txt',
    };
    const currentUser = {};
    const oldPassword = '654321';
    const hashedPassword = await bcrypt.hash(oldPassword, 10);
    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
      user_password: hashedPassword,
      user_role: {
        role_id: 1,
        role_name: 'admin',
      },
    };
    const existinUser = {
      user_id: 2,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
      user_password: hashedPassword,
      user_role: {
        role_id: 1,
        role_name: 'admin',
      },
    };
    userRepo.findOne.mockResolvedValue(fakeUser);
    userRepo.findOne.mockResolvedValue(existinUser);
    await expect(
      service.editUserInfo(id, body, file, currentUser),
    ).rejects.toThrow(new BadRequestException('Email already taken'));

    expect(userRepo.findOne).toHaveBeenCalledWith({
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

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_email: body.newEmail },
    });
  });
  it('when the email changes and the new email is available, generate token with the new data and add it to the token and send it as a link', async () => {
    const id = '1';
    const body: any = {
      newName: 'ezz',
      newEmail: 'ezz3@gmail.com',
      oldPassword: '654321',
      newPassword: '654321',
    };
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 0,
      filename: 'test.txt',
    };
    const imagePath = `/uploads/${file.filename}`;

    const currentUser = {};
    const hashedPassword = await bcrypt.hash(body.oldPassword, 10);

    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
      user_password: hashedPassword,
      user_role: {
        role_id: 1,
        role_name: 'admin',
      },
    };

    userRepo.findOne
      .mockResolvedValueOnce(fakeUser) // first call
      .mockResolvedValueOnce(null); // second call

    (jwt.sign as jest.Mock).mockReturnValue('fakeToken');

    const result = await service.editUserInfo(id, body, file, currentUser);

    expect(result.success).toBe(true);
    expect(result.message).toEqual('Verification link sent to new email');

    expect(userRepo.findOne).toHaveBeenNthCalledWith(1, {
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

    expect(userRepo.findOne).toHaveBeenNthCalledWith(2, {
      where: { user_email: body.newEmail },
    });

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: id,
        newName: body.newName,
        newEmail: body.newEmail,
        newHashPassword: expect.any(String),
        imagePath,
      }),
      expect.any(String),
      { expiresIn: '1h' },
    );

    const sendEmailMock = (nodemailer as any).__mockedSendMail;

    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: body.newEmail,
        subject: 'Verify your email',
        html: expect.stringContaining(
          'http://localhost:5000/api/user/verify-email?token=fakeToken',
        ),
      }),
    );
  });
  it('without email change , we successfully change the other user data ', async () => {
    const id = '1';
    const body: any = {
      newName: 'ezz22',
      newEmail: 'ezz3@gmail.com',
      oldPassword: '654321',
      newPassword: '654321',
    };
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 0,
      filename: 'test.txt',
    };
    const imagePath = `/uploads/${file.filename}`;

    const currentUser = {};
    const hashedPassword = await bcrypt.hash(body.oldPassword, 10);
    const newHashedPassword = await bcrypt.hash(body.newPassword, 10);
    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz3@gmail.com',
      user_password: hashedPassword,
      user_role: {
        role_id: 1,
        role_name: 'admin',
      },
    };
    const fakeUser2 = {
      user_id: 1,
      user_name: 'ezz22',
      user_email: 'ezz3@gmail.com',
      user_password: newHashedPassword,
      profilePicture: imagePath,
      user_role: {
        role_id: 1,
        role_name: 'admin',
      },
    };
    const fakeRole = {
      role_id: 1,
      role_name: 'fatcat',
      users: [fakeUser],
    };

    userRepo.findOne.mockResolvedValueOnce(fakeUser);
    userRepo.save.mockResolvedValueOnce(fakeUser2);
    userRepo.findOne.mockResolvedValueOnce(fakeUser2);
    rolesRepo.findOne.mockResolvedValueOnce(fakeRole);

    const result = await service.editUserInfo(id, body, file, currentUser);

    expect(result.success).toBe(true);
    expect(result.newUser).toEqual({
      _id: fakeUser2.user_id,
      name: fakeUser2.user_name,
      email: fakeUser2.user_email,
      role: fakeRole.role_name,
      profilePicture: imagePath,
    });

    expect(userRepo.findOne).toHaveBeenNthCalledWith(1, {
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

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: fakeUser2.user_id,
        user_name: fakeUser2.user_name,
        user_email: fakeUser2.user_email,
        profilePicture: fakeUser2.profilePicture,
        user_role: fakeUser2.user_role,
        user_password: expect.any(String),
      }),
    );

    expect(userRepo.findOne).toHaveBeenNthCalledWith(2, {
      where: { user_id: Number(id) },
    });

    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where: { users: { user_id: Number(id) } },
    });
  });
});

describe('UserService - admin edit user info', () => {
  let service: UserService;
  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },

        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });
  //   it("should throw http exception if the admin user is not an admin " , async() =>{
  //   const dto : any = {userId : "1", newName : "ezz2", newEmail : "ezz@gmail.com", newPassword : "123456"}
  //   const id = "2"
  //   rolesRepo.findOne.mockResolvedValue(null)

  //   await expect(service.adminEditUserInfo(id ,dto)).rejects.toThrow(
  //      new HttpException('Only the admin can edit user info', HttpStatus.UNAUTHORIZED)
  //   )

  //   expect(rolesRepo.findOne).toHaveBeenCalledWith(
  //     {
  //           where : {users :{
  //               user_id : Number(dto.userId)
  //           }},
  //           relations : ['users']
  //     }
  //   )
  // })
  it('should throw not found error when the target user not found ', async () => {
    const dto: any = {
      userId: '1',
      newName: 'ezz2',
      newEmail: 'ezz@gmail.com',
      newPassword: '123456',
    };
    const id = '2';
    // const fakeAdminRole = {
    //   role_id : 1,
    //   role_name : "admin",
    //   users:[],
    //   permissions:[]
    // }
    // rolesRepo.findOne.mockResolvedValue(fakeAdminRole)
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.adminEditUserInfo(id, dto)).rejects.toThrow(
      new NotFoundException('user not found'),
    );

    // expect(rolesRepo.findOne).toHaveBeenCalledWith(
    //   {
    //         where : {users :{
    //             user_id : Number(dto.userId)
    //         }},
    //         relations : ['users']
    //   }
    // )

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(dto.userId) },
    });
  });
  it('should find the user and change the user data , the admin insert these data  ', async () => {
    const dto: any = {
      userId: '1',
      newName: 'ezz2',
      newEmail: 'ezz@gmail.com',
      newPassword: '654321',
    };
    const id = '2';
    const fakeAdminRole = {
      role_id: 1,
      role_name: 'admin',
      users: [],
      permissions: [],
    };
    const hashedPassword = await bcrypt.hash('123456', 10);
    const nwHashedPassword = await bcrypt.hash(dto.newPassword, 10);
    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
      user_password: hashedPassword,
    };

    const updatedUser = {
      ...fakeUser,
      user_name: dto.newName,
      user_email: dto.newEmail,
    };
    const { user_password, ...safeUser } = updatedUser;
    // rolesRepo.findOne.mockResolvedValue(fakeAdminRole)
    userRepo.findOne.mockResolvedValue(fakeUser);
    userRepo.save.mockResolvedValue(updatedUser);

    const result = await service.adminEditUserInfo(id, dto);

    expect(result.success).toBe(true);
    expect(result.message).toEqual('User updated successfully');
    expect(result.updatedUser).toMatchObject(safeUser);
    // expect(rolesRepo.findOne).toHaveBeenCalledWith(
    //   {
    //         where : {users :{
    //             user_id : Number(dto.userId)
    //         }},
    //         relations : ['users']
    //   }
    // )

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(dto.userId) },
    });
    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: fakeUser.user_id,
        user_name: dto.newName,
        user_email: dto.newEmail,
        user_password: expect.any(String),
      }),
    );
  });
});

describe('UserService -get user by id ', () => {
  let service: UserService;
  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },

        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });
  it('should throw new error if the user not found', async () => {
    const id = '1';
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.getUserById(id)).rejects.toThrow(
      new NotFoundException('user not found'),
    );
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(id) },
    });
  });
  it('should throw new error if the user not found', async () => {
    const id = '1';
    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
    };
    userRepo.findOne.mockResolvedValue(fakeUser);
    rolesRepo.findOne.mockResolvedValue(null);

    await expect(service.getUserById(id)).rejects.toThrow(
      new NotFoundException('role  not found'),
    );
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(id) },
    });
    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where: { users: { user_id: Number(id) } },
    });
  });
  it('should return the user groups and complaints and other data', async () => {
    const id = '1';
    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
    };
    const fakeRole = {
      role_id: 1,
      role_name: 'user',
      users: [fakeUser],
      permissions: [],
    };
    const fakeGroups = [
      {
        group_id: 1,
        group_name: 'HR',
        users: [fakeUser],
      },
    ];

    const fakeComplaints = [
      {
        complaint_id: 1,
        description: 'testing',
        creator_user: fakeUser,
        complaint_status: 'pending',
        complaint_type: 'general',
      },
    ];
    userRepo.findOne.mockResolvedValue(fakeUser);
    rolesRepo.findOne.mockResolvedValue(fakeRole);
    const queryBuilder: any = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue(fakeGroups),
    };
    groupRepo.createQueryBuilder.mockReturnValue(queryBuilder);
    complaintRepo.find.mockResolvedValue(fakeComplaints);

    const expectedUser = plainToInstance(UserOutputDto, fakeUser, {
      excludeExtraneousValues: true,
    });
    const expectedComplaints = plainToInstance(
      ComplaintOutputDto,
      fakeComplaints,
      { excludeExtraneousValues: true },
    );
    const result = await service.getUserById(id);
    expect(result.success).toBe(true);
    expect(result.user).toMatchObject(expectedUser);
    expect(result.groups).toMatchObject(fakeGroups);
    expect(result.role).toEqual(fakeRole.role_name);
    expect(result.complaints).toMatchObject(expectedComplaints);

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(id) },
    });
    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where: { users: { user_id: Number(id) } },
    });

    expect(groupRepo.createQueryBuilder).toHaveBeenCalledWith('group_entity');
    expect(queryBuilder.leftJoin).toHaveBeenCalledWith(
      'group_entity.users',
      'user_info',
    );
    expect(queryBuilder.where).toHaveBeenCalledWith('user_info.user_id = :id', {
      id: Number(id),
    });

    expect(queryBuilder.select).toHaveBeenCalledWith([
      'group_entity.group_id',
      'group_entity.group_name',
      'user_info.user_id',
      'user_info.user_name',
    ]);
    expect(queryBuilder.getMany).toHaveBeenCalled();

    expect(complaintRepo.find).toHaveBeenCalledWith({
      where: { creator_user: { user_id: Number(id) } },
    });
  });
});

describe('UserService - get summary as charts data', () => {
  let service: UserService;
  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },

        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should throw not found error when the complaints data are not found or empty', async () => {
    const id = '1';

    const queryBuilder1 = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(null),
    };

    const queryBuilder2 = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(null),
    };

    (complaintRepo.createQueryBuilder as jest.Mock)
      .mockReturnValueOnce(queryBuilder1)
      .mockReturnValueOnce(queryBuilder2);

    await expect(service.getSummaryCharts(id)).rejects.toThrow(
      new NotFoundException('error getting the summary of the complaints'),
    );

    expect(complaintRepo.createQueryBuilder).toHaveBeenCalledWith(
      'complaint_info',
    );
    expect(queryBuilder1.select).toHaveBeenCalledWith(
      'complaint_info.complaint_type',
      'complaint_type',
    );
    expect(queryBuilder1.addSelect).toHaveBeenCalledWith('COUNT(*)', 'total');
    expect(queryBuilder1.groupBy).toHaveBeenCalledWith(
      'complaint_info.complaint_type',
    );
    expect(queryBuilder1.getRawMany).toHaveBeenCalled();
  });
});

describe('UserService - get leaves summary as charts data', () => {
  let service: UserService;
  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let leavesRepo: {
    count: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };
    leavesRepo = {
      count: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: leavesRepo },

        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should return bad request exception if the user not number string', async () => {
    const userId = 'aa';
    await expect(service.getLeavesSummaryChartMonthly(userId)).rejects.toThrow(
      new BadRequestException('user id is invalid'),
    );
  });
  it('should return not found exception if the user not found in the db', async () => {
    const userId = '1';

    userRepo.findOne.mockResolvedValue(null);

    await expect(service.getLeavesSummaryChartMonthly(userId)).rejects.toThrow(
      new NotFoundException('user not found'),
    );
  });
  it('should return the leaves count after finding the user in the db and getting his leaves', async () => {
    const userId = '1';
    const fakeUser = {
      user_id: 1,
      user_email: 'ezz@gmail.com',
      user_name: 'ezz',
    };

    const totalLeaves = 10;
    const acceptedLeaves = 10;
    const rejectedLeaves = 20;
    const pendingLeaves = 13;
    const handeledLeaves = 17;

    const now = new Date();
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfLastMonth = new Date();
    userRepo.findOne.mockResolvedValue(fakeUser);

    leavesRepo.count.mockResolvedValueOnce(totalLeaves);
    leavesRepo.count.mockResolvedValueOnce(acceptedLeaves);
    leavesRepo.count.mockResolvedValueOnce(rejectedLeaves);
    leavesRepo.count.mockResolvedValueOnce(pendingLeaves);
    leavesRepo.count.mockResolvedValueOnce(handeledLeaves);

    const result = await service.getLeavesSummaryChartMonthly(userId);
    expect(result.success).toBe(true);
    expect(result.totalLeaves).toEqual(totalLeaves);
    expect(result.acceptedLeaves).toEqual(acceptedLeaves);
    expect(result.rejectedLeaves).toEqual(rejectedLeaves);
    expect(result.pendingLeaves).toEqual(pendingLeaves);
    expect(result.handeledLeaves).toEqual(handeledLeaves);

    expect(leavesRepo.count).toHaveBeenCalledWith({
      where: { leave_user: { user_id: Number(userId) } },
    });
    expect(leavesRepo.count).toHaveBeenCalledWith({
      where: {
        leave_user: { user_id: Number(userId) },
        leave_status: 'accepted' as LeaveStatus,
        created_at: Between(firstDayOfLastMonth, lastDayOfLastMonth),
      },
    });
    expect(leavesRepo.count).toHaveBeenCalledWith({
      where: {
        leave_user: { user_id: Number(userId) },
        leave_status: LeaveStatus.REJECTED,
        created_at: Between(firstDayOfLastMonth, lastDayOfLastMonth),
      },
    });
    expect(leavesRepo.count).toHaveBeenCalledWith({
      where: {
        leave_user: { user_id: Number(userId) },
        leave_status: LeaveStatus.PENDING,
        created_at: Between(firstDayOfLastMonth, lastDayOfLastMonth),
      },
    });
    expect(leavesRepo.count).toHaveBeenCalledWith({
      where: {
        leave_handler: { user_id: Number(userId) },
        created_at: Between(firstDayOfLastMonth, lastDayOfLastMonth),
      },
    });
  });
});

describe('UserService - verify email update', () => {
  let service: UserService;

  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };
  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    jest.spyOn(EmailUtils2, 'sendComplaintEmail').mockResolvedValue(undefined);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should throw if no token is provided', async () => {
    await expect(service.verifyEmailUpdate(null)).rejects.toThrow(
      HttpException,
    );
  });
  it('should throw if token is invalid', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(service.verifyEmailUpdate('fakeToken')).rejects.toThrow(
      'Invalid or expired token',
    );
  });
  it('should throw if user not found', async () => {
    const fakeDecoded = { _id: 1, newName: 'Ezz' };
    jest.spyOn(jwt, 'verify').mockReturnValue(fakeDecoded);
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.verifyEmailUpdate('fakeToken')).rejects.toThrow(
      'user not found',
    );
  });
  it('should update the user and return the verification URL', async () => {
    const fakeDecoded = {
      _id: 1,
      newName: 'Ezz',
      newEmail: 'ezz@gmail.com',
      newHashPassword: 'hash',
      imagePath: '/uploads/img.png',
    };
    const fakeUser = { user_id: 1, user_email: 'old@gmail.com' };

    jest.spyOn(jwt, 'verify').mockReturnValue(fakeDecoded);
    userRepo.findOne.mockResolvedValue(fakeUser);
    userRepo.update.mockResolvedValue({});

    const result = await service.verifyEmailUpdate('fakeToken');

    expect(userRepo.update).toHaveBeenCalledWith(fakeDecoded._id, {
      user_name: 'Ezz',
      user_email: 'ezz@gmail.com',
      user_password: 'hash',
      profilePicture: '/uploads/img.png',
    });

    expect(result).toBe('http://localhost:5173/email-verified?token=fakeToken');
  });
});

describe('UserService - delete user ', () => {
  let service: UserService;

  let userRepo: {
    findOne: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
  };
  let rolesRepo: {
    create: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let complaintgroupsRuleRepo: {
    findOne: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };
  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    rolesRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    jest.spyOn(EmailUtils2, 'sendComplaintEmail').mockResolvedValue(undefined);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(ComplaintEntity),
          useValue: complaintRepo,
        },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        {
          provide: getRepositoryToken(ComplaintGroupsRuleEntity),
          useValue: complaintgroupsRuleRepo,
        },
        { provide: getRepositoryToken(LeavesEntity), useValue: {} },
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  //delete user
  it('should throw not found error when the user is not found', async () => {
    const userId = '1';
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.deleteUser(userId)).rejects.toThrow(
      new NotFoundException('User not found'),
    );

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(userId) },
    });
  });
  it('should throw not found error when the user is not found', async () => {
    const userId = '1';
    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      useR_email: 'ezz@gmail.com',
    };
    userRepo.findOne.mockResolvedValue(fakeUser);
    const queryBuilder = {
      relation: jest.fn().mockReturnThis(),
      of: jest.fn().mockReturnThis(),
      remove: jest.fn().mockResolvedValue(true),
    };
    rolesRepo.createQueryBuilder.mockReturnValue(queryBuilder);
    userRepo.delete.mockResolvedValue(true);

    const result = await service.deleteUser(userId);
    expect(result.success).toBe(true);
    expect(result.message).toEqual(
      'User and associated data deleted successfully.',
    );

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(userId) },
    });
    expect(rolesRepo.createQueryBuilder).toHaveBeenCalledWith('role_info');
    expect(queryBuilder.relation).toHaveBeenCalledWith(RolesEntity, 'users');
    expect(queryBuilder.of).toHaveBeenCalledWith(fakeUser);
    expect(queryBuilder.remove).toHaveBeenCalledWith(fakeUser);

    expect(userRepo.delete).toHaveBeenCalledWith(Number(userId));
  });
});
