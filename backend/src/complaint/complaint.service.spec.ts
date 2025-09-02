import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ComplaintEntity } from './entities/complaint.entity';
import { RolesEntity } from '../roles/entities/roles.entity';
import { ComplaintGroupsRuleEntity } from './entities/complaint-groups-rule.entity';
import { GroupEntity } from '../groups/entities/group.entity';
import { ComplaintService } from './complaint.service';
import { LogsService } from '../logs/logs.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as EmailUtils from '../utils/send-complaints-email.util';
import { PaginatedResponseDto } from './dtos/paginated-response.dto';
import { ComplaintOutputDto } from './dtos/complaint-output.dto';
import { plainToInstance } from 'class-transformer';

describe('ComplaintService', () => {
  let service: ComplaintService;

  let userRepo: {
    findOne: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
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
    };
    groupRepo = {
      findOne: jest.fn(),
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
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    jest.spyOn(EmailUtils, 'sendComplaintEmail').mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintService,

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
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<ComplaintService>(ComplaintService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('ComplaintService - Add Complaint', () => {
  let service: ComplaintService;

  let userRepo: {
    findOne: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
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
    };
    groupRepo = {
      findOne: jest.fn(),
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
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    jest.spyOn(EmailUtils, 'sendComplaintEmail').mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintService,

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
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<ComplaintService>(ComplaintService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //addcomplaint
  it('should throw error when the description and usrId are empty ', async () => {
    const dto: any = { type: 'general' };
    await expect(service.addComplaint(dto, 1)).rejects.toThrow(
      new BadRequestException('Description and userId are required'),
    );
  });
  it('should throw error when the user not found', async () => {
    userRepo.findOne.mockResolvedValue(null);
    const dto: any = { description: '123123', type: 'technical' };
    const userId = 1;
    await expect(service.addComplaint(dto, 1)).rejects.toThrow(
      new NotFoundException('User not found'),
    );
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: 1 },
    });
  });
  it('should throw error when no group found', async () => {
    const dto: any = { description: '123123', type: 'technical' };
    const userId = 1;
    const user = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'test@gmail.com',
      profilePicture: 'any.jpg',
    };

    userRepo.findOne.mockResolvedValue(user);
    await expect(service.addComplaint(dto, userId)).rejects.toThrow(
      new NotFoundException('No default group to take the complaint'),
    );
    expect(groupRepo.findOne).toHaveBeenCalledWith({
      where: { group_name: 'HR' },
    });
  });
  it('create a new complaint and save it and then return the success message', async () => {
    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'test@gmail.com',
      profilePicture: 'any.jpg',
    };
    const fakeGroup = {
      group_id: 1,
      group_name: 'HR',
      created_at: new Date(),
    };
    const dto: any = {
      type: 'technical',
      description: 'testing the description',
    };
    userRepo.findOne.mockResolvedValue(fakeUser);
    groupRepo.findOne.mockResolvedValue(fakeGroup);
    complaintRepo.create.mockReturnValue({
      description: dto.description,
      complaint_type: dto.type,
      creator_user: fakeUser,
      groupsQueue: [fakeGroup],
    });
    complaintRepo.save.mockResolvedValue(true);

    const result = await service.addComplaint(dto, 1);

    expect(result).toEqual({
      success: true,
      message: 'Complaint added successfully',
    });
  });
});

describe('ComplaintService - Handle Complaint in group', () => {
  let service: ComplaintService;

  let userRepo: {
    findOne: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
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
    };
    groupRepo = {
      findOne: jest.fn(),
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
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    jest.spyOn(EmailUtils, 'sendComplaintEmail').mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintService,

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
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<ComplaintService>(ComplaintService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //handle complaint in the group
  it('should throw an error when the complaint not found', async () => {
    const dto: any = { userId: '123', status: 'accept' };
    complaintRepo.findOne.mockResolvedValue(null);

    expect(service.handleComplaintInGroup('1', dto)).rejects.toThrow(
      new NotFoundException('Complaint not found'),
    );
  });
  it('should throw error when no groups in the complaint rule found', async () => {
    const dto: any = { userId: '123', status: 'accept' };
    const fakeComplaint = {
      complaint_id: 1,
      complaint_user: 'user',
      description: 'complaint description',
      complaint_status: 'technical',
      groupsQueue: [],
    };

    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue({ user_id: '1' });
    complaintgroupsRuleRepo.findOne.mockResolvedValue(null);

    const result = await service.handleComplaintInGroup('1', dto);
    expect(result.status).toBe(500);
  });
  it('should throw error when the complaint is already handeled', async () => {
    const dto: any = { userId: '123', status: 'accept' };
    const fakeComplaint = {
      complaint_id: 1,
      creator_user: {
        user_id: 1,
        user_email: 'test@test.com',
        user_name: 'John',
      },
      description: 'complaint description',
      complaint_status: 'technical',
      groupsQueue: ['groupA', 'groupB'],
    };
    const fakeGroups = ['groupA'];
    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue({
      user_id: 1,
      user_email: 'test@test.com',
      user_name: 'John',
    });
    complaintgroupsRuleRepo.findOne.mockResolvedValue({ groups: fakeGroups });

    const result = await service.handleComplaintInGroup('1', dto);
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Complaint already handled');
  });
  it('should throw new error when the complaint is already handeled before with the current group', async () => {
    const dto: any = { userId: '123', status: 'accept' };
    const fakeComplaint = {
      complaint_id: 1,
      creator_user: {
        user_id: 1,
        user_email: 'test@test.com',
        user_name: 'John',
      },
      description: 'complaint description',
      complaint_status: 'technical',
      groupsQueue: ['groupA'],
    };
    const fakeGroups = ['groupA', 'groupA'];
    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue({
      user_id: 1,
      user_email: 'test@test.com',
      user_name: 'John',
    });
    complaintgroupsRuleRepo.findOne.mockResolvedValue({ groups: fakeGroups });

    const result = await service.handleComplaintInGroup('1', dto);
    expect(result.status).toBe(400);
    expect(result.body.message).toBe(
      'Current group already handled this complaint.',
    );
  });
  it('accepts the complaint and resolves last group', async () => {
    const dto: any = { userId: '123', status: 'accept' };

    const fakeComplaint = {
      complaint_id: 1,
      creator_user: {
        user_id: 123,
        user_email: 'ezz@test.com',
        user_name: 'John',
      },
      description: 'complaint description',
      complaint_status: 'technical',
      groupsQueue: [],
    };

    const fakeGroups = ['groupA'];

    const user = {
      user_id: 123,
      user_name: 'ezz',
      useR_email: 'ezz@gmail.com',
      user_password: '123456',
      profilePicture: '',
    };

    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue(user);
    complaintgroupsRuleRepo.findOne.mockResolvedValue({ groups: fakeGroups });

    const result = await service.handleComplaintInGroup('1', dto);

    expect(EmailUtils.sendComplaintEmail).toHaveBeenCalledWith(
      fakeComplaint.creator_user.user_email,
      expect.any(String),
      fakeComplaint.creator_user.user_name,
    );

    expect(logsService.logAction).toHaveBeenCalledWith(
      user,
      'Resolve',
      'Complaint',
      1,
      'Final group resolved the complaint.',
    );

    expect(result.status).toBe(200);
    expect(result.body.message).toContain('resolved');
  });
  it('should change the compalint state to in pregress andreturn true and moves to the next groups in the rule', async () => {
    const dto: any = { userId: '123', status: 'accept' };

    const fakeComplaint = {
      complaint_id: 1,
      creator_user: {
        user_id: 123,
        user_email: 'ezz@test.com',
        user_name: 'John',
      },
      description: 'complaint description',
      complaint_status: 'technical',
      groupsQueue: ['groupB'],
    };

    const fakeGroups = [
      { group_name: 'HR', user: [] }, // must be object
    ];
    const fakeGroupA = {
      group_id: 1,
      group_name: 'HR',
      user: [],
    };
    const user = {
      user_id: 123,
      user_name: 'ezz',
      useR_email: 'ezz@gmail.com',
      user_password: '123456',
      profilePicture: '',
    };
    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue(user);
    complaintgroupsRuleRepo.findOne.mockResolvedValue({
      groups: [{ group_name: 'HR' }],
    });

    const result = await service.handleComplaintInGroup('1', dto);
    expect(logsService.logAction).toHaveBeenCalledWith(
      user,
      'Accept',
      'Complaint',
      1,
      `Complaint accepted by one of the groups in the rule.`,
    );
    expect(result.status).toBe(200);
    expect(result.body.message).toContain('Accepted');
  });
  it('rejects the complaint , send email , add the log ', async () => {
    const dto: any = { userId: '123', status: 'reject' };

    const fakeComplaint = {
      complaint_id: 1,
      creator_user: {
        user_id: 123,
        user_email: 'ezz@test.com',
        user_name: 'John',
      },
      description: 'complaint description',
      complaint_status: 'technical',
      groupsQueue: ['groupB'],
    };

    const fakeGroups = [
      { group_name: 'HR', user: [] }, // must be object
    ];
    const fakeGroupA = {
      group_id: 1,
      group_name: 'HR',
      user: [],
    };
    const user = {
      user_id: 123,
      user_name: 'ezz',
      useR_email: 'ezz@gmail.com',
      user_password: '123456',
      profilePicture: '',
    };
    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue(user);
    complaintgroupsRuleRepo.findOne.mockResolvedValue({
      groups: [{ group_name: 'HR' }],
    });

    const result = await service.handleComplaintInGroup('1', dto);

    expect(EmailUtils.sendComplaintEmail).toHaveBeenCalledWith(
      fakeComplaint.creator_user.user_email,
      expect.any(String),
      fakeComplaint.creator_user.user_name,
    );

    expect(logsService.logAction).toHaveBeenCalledWith(
      user,
      'Reject',
      'Complaint',
      1,
      `Complaint Rejected by the complaint groups rule .`,
    );
    expect(result.status).toBe(200);
    expect(result.body.message).toContain('Rejected');
  });
});

describe('ComplaintService - List Complaints', () => {
  let service: ComplaintService;

  let userRepo: {
    findOne: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
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
    };
    groupRepo = {
      findOne: jest.fn(),
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
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    jest.spyOn(EmailUtils, 'sendComplaintEmail').mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintService,

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
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<ComplaintService>(ComplaintService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //list complaints
  it('should return complaints based on what page is called , event if there is no complaints it return empty array', async () => {
    const dto: any = { page: 1, limit: 10 };
    const fakeComplaints = [
      {
        complaint_id: 1,
        description: 'this is description',
        complaint_status: 'pending',
        complaint_type: 'general',
        creator_user: {
          user_id: 1,
          user_name: 'ezz',
          user_email: 'ezz@gmail.com',
        },
        groupsQueue: [],
        created_at: new Date(),
      },
      {
        complaint_id: 2,
        description: 'this is second description',
        complaint_status: 'pending',
        complaint_type: 'general',
        creator_user: {
          user_id: 4,
          user_name: 'ezz',
          user_email: 'ezz@gmail.com',
        },
        groupsQueue: [],
        created_at: new Date(),
      },
    ];

    const skip = (dto.page - 1) * dto.limit;
    const totalCount = fakeComplaints.length;

    complaintRepo.count.mockResolvedValue(totalCount);
    complaintRepo.find.mockResolvedValue(fakeComplaints);

    const result = await service.listComplaints(dto);

    expect(result).toBeInstanceOf(PaginatedResponseDto);
    expect(result).toMatchObject({
      success: true,
      complaints: [
        expect.objectContaining({ complaint_id: 1 }),
        expect.objectContaining({ complaint_id: 2 }),
      ],
      currentPage: dto.page,
      totalPages: 1,
      totalCount: totalCount,
    });

    expect(complaintRepo.find).toHaveBeenCalledWith({
      relations: ['creator_user'],
      select: {
        creator_user: { user_password: false },
      },
      order: { created_at: 'DESC' },
      skip: skip,
      take: dto.limit,
    });
  });

  //get complaint info
  it('should throw bad request errror when the id is invalid', async () => {
    const id = 'ss';

    await expect(service.getComplaintInfo('')).rejects.toThrow(
      new BadRequestException('please provide the correct id'),
    );
    await expect(service.getComplaintInfo(id)).rejects.toThrow(
      new BadRequestException('please provide the correct id'),
    );
  });
  it('should throw not fouond error when the complaint not found', async () => {
    const id = '1';

    complaintRepo.findOne.mockResolvedValue(null);

    await expect(service.getComplaintInfo(id)).rejects.toThrow(
      new NotFoundException('complaint not found'),
    );
  });
  it('found the complaint and return it and return success too', async () => {
    const id = '1';
    const fakeCompalint = {
      complaint_id: 1,
      complaint_status: 'pending',
      complaint_type: 'general',
      created_at: new Date(),
      creator_user: {
        user_email: 'ezz@gmail.com',
        profilePicture: 'any.jpg',
        user_id: 1,
        user_name: 'ezz',
      },
    };
    complaintRepo.findOne.mockResolvedValue(fakeCompalint);

    const expectedOutput = plainToInstance(ComplaintOutputDto, fakeCompalint, {
      excludeExtraneousValues: true,
    });
    const result = await service.getComplaintInfo(id);
    expect(result.success).toBe(true);
    expect(result.complaint).toMatchObject(expectedOutput);

    expect(complaintRepo.findOne).toHaveBeenCalledWith({
      where: { complaint_id: Number(id) },
      relations: ['creator_user'],
      select: {
        complaint_id: true,
        complaint_status: true,
        complaint_type: true,
        created_at: true,
        description: true,
        creator_user: {
          user_email: true,
          profilePicture: true,
          user_id: true,
          user_name: true,
          user_password: false,
          user_role: false,
        },
      },
    });
  });

  //list user complaints
  it('should throw not found error when the user not found', async () => {
    const id = '1';

    userRepo.findOne.mockResolvedValue(null);

    await expect(service.listUsrComplaints(id)).rejects.toThrow(
      new NotFoundException(' user not found '),
    );
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(id) },
    });
  });
  it('should return all the user complaints', async () => {
    const id = '1';
    const fakeUser = {
      user_id: 1,
      useR_name: 'ezz',
      user_email: 'ezz@gmail.com',
    };
    const fakeComplaints = [
      {
        complaint_id: 1,
        complaint_status: 'pending',
        complaint_type: 'general',
        created_at: new Date(),
        creator_user: {
          user_email: 'ezz@gmail.com',
          profilePicture: 'any.jpg',
          user_id: 1,
          user_name: 'ezz',
        },
      },
    ];
    userRepo.findOne.mockResolvedValue(fakeUser);
    complaintRepo.find.mockResolvedValue(fakeComplaints);

    const result = await service.listUsrComplaints(id);
    const expectedComplaints = plainToInstance(
      ComplaintOutputDto,
      fakeComplaints,
      { excludeExtraneousValues: true },
    );
    expect(result.success).toBe(true);
    expect(result.complaints).toMatchObject(expectedComplaints);
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(id) },
    });
    expect(complaintRepo.find).toHaveBeenCalledWith({
      where: { creator_user: { user_id: Number(id) } },
      relations: ['creator_user'],
      select: {
        complaint_id: true,
        complaint_status: true,
        complaint_type: true,
        created_at: true,
        creator_user: {
          user_name: true,
          user_email: true,
          user_id: true,
          user_password: false,
          user_role: false,
        },
      },
    });
  });

  //delete complaint
  it('should throw bad request error when the ids are not valid', async () => {
    const userId = 'a';
    const complaintId = 'e';
    await expect(service.deleteComplaint(userId, '1')).rejects.toThrow(
      new BadRequestException('Invalid userId or complaintId'),
    );

    await expect(service.deleteComplaint('1', complaintId)).rejects.toThrow(
      new BadRequestException('Invalid userId or complaintId'),
    );
  });
  it('should throw not found error when complaint not found', async () => {
    const userId = '1';
    const complaintId = '1';

    complaintRepo.findOne.mockResolvedValue(null);

    await expect(service.deleteComplaint(userId, complaintId)).rejects.toThrow(
      new NotFoundException('complaint not found'),
    );

    expect(complaintRepo.findOne).toHaveBeenCalledWith({
      where: { complaint_id: Number(complaintId) },
      relations: ['creator_user'],
    });
  });
  it('should throw not found error when user not found', async () => {
    const userId = '1';
    const complaintId = '1';

    const fakeComplaint = {
      complaint_id: 1,
      complaint_status: 'pending',
      complaint_type: 'general',
      created_at: new Date(),
      creator_user: {
        user_email: 'ezz@gmail.com',
        profilePicture: 'any.jpg',
        user_id: 1,
        user_name: 'ezz',
      },
    };
    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    rolesRepo.findOne.mockResolvedValue(null);

    await expect(service.deleteComplaint(userId, complaintId)).rejects.toThrow(
      new NotFoundException('user not found'),
    );

    expect(complaintRepo.findOne).toHaveBeenCalledWith({
      where: { complaint_id: Number(complaintId) },
      relations: ['creator_user'],
    });
    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where: { users: { user_id: Number(userId) } },
      relations: ['users'],
    });
  });
});

describe('ComplaintService - Get Complaint Info', () => {
  let service: ComplaintService;

  let userRepo: {
    findOne: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
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
    };
    groupRepo = {
      findOne: jest.fn(),
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
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    jest.spyOn(EmailUtils, 'sendComplaintEmail').mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintService,

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
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<ComplaintService>(ComplaintService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //get complaint info
  it('should throw bad request errror when the id is invalid', async () => {
    const id = 'ss';

    await expect(service.getComplaintInfo('')).rejects.toThrow(
      new BadRequestException('please provide the correct id'),
    );
    await expect(service.getComplaintInfo(id)).rejects.toThrow(
      new BadRequestException('please provide the correct id'),
    );
  });
  it('should throw not fouond error when the complaint not found', async () => {
    const id = '1';

    complaintRepo.findOne.mockResolvedValue(null);

    await expect(service.getComplaintInfo(id)).rejects.toThrow(
      new NotFoundException('complaint not found'),
    );
  });
  it('found the complaint and return it and return success too', async () => {
    const id = '1';
    const fakeCompalint = {
      complaint_id: 1,
      complaint_status: 'pending',
      complaint_type: 'general',
      created_at: new Date(),
      creator_user: {
        user_email: 'ezz@gmail.com',
        profilePicture: 'any.jpg',
        user_id: 1,
        user_name: 'ezz',
      },
    };
    complaintRepo.findOne.mockResolvedValue(fakeCompalint);

    const expectedOutput = plainToInstance(ComplaintOutputDto, fakeCompalint, {
      excludeExtraneousValues: true,
    });
    const result = await service.getComplaintInfo(id);
    expect(result.success).toBe(true);
    expect(result.complaint).toMatchObject(expectedOutput);

    expect(complaintRepo.findOne).toHaveBeenCalledWith({
      where: { complaint_id: Number(id) },
      relations: ['creator_user'],
      select: {
        complaint_id: true,
        complaint_status: true,
        complaint_type: true,
        created_at: true,
        description: true,
        creator_user: {
          user_email: true,
          profilePicture: true,
          user_id: true,
          user_name: true,
          user_password: false,
          user_role: false,
        },
      },
    });
  });

  //list user complaints
  it('should throw not found error when the user not found', async () => {
    const id = '1';

    userRepo.findOne.mockResolvedValue(null);

    await expect(service.listUsrComplaints(id)).rejects.toThrow(
      new NotFoundException(' user not found '),
    );
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(id) },
    });
  });
  it('should return all the user complaints', async () => {
    const id = '1';
    const fakeUser = {
      user_id: 1,
      useR_name: 'ezz',
      user_email: 'ezz@gmail.com',
    };
    const fakeComplaints = [
      {
        complaint_id: 1,
        complaint_status: 'pending',
        complaint_type: 'general',
        created_at: new Date(),
        creator_user: {
          user_email: 'ezz@gmail.com',
          profilePicture: 'any.jpg',
          user_id: 1,
          user_name: 'ezz',
        },
      },
    ];
    userRepo.findOne.mockResolvedValue(fakeUser);
    complaintRepo.find.mockResolvedValue(fakeComplaints);

    const result = await service.listUsrComplaints(id);
    const expectedComplaints = plainToInstance(
      ComplaintOutputDto,
      fakeComplaints,
      { excludeExtraneousValues: true },
    );
    expect(result.success).toBe(true);
    expect(result.complaints).toMatchObject(expectedComplaints);
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(id) },
    });
    expect(complaintRepo.find).toHaveBeenCalledWith({
      where: { creator_user: { user_id: Number(id) } },
      relations: ['creator_user'],
      select: {
        complaint_id: true,
        complaint_status: true,
        complaint_type: true,
        created_at: true,
        creator_user: {
          user_name: true,
          user_email: true,
          user_id: true,
          user_password: false,
          user_role: false,
        },
      },
    });
  });

  //delete complaint
  it('should throw bad request error when the ids are not valid', async () => {
    const userId = 'a';
    const complaintId = 'e';
    await expect(service.deleteComplaint(userId, '1')).rejects.toThrow(
      new BadRequestException('Invalid userId or complaintId'),
    );

    await expect(service.deleteComplaint('1', complaintId)).rejects.toThrow(
      new BadRequestException('Invalid userId or complaintId'),
    );
  });
  it('should throw not found error when complaint not found', async () => {
    const userId = '1';
    const complaintId = '1';

    complaintRepo.findOne.mockResolvedValue(null);

    await expect(service.deleteComplaint(userId, complaintId)).rejects.toThrow(
      new NotFoundException('complaint not found'),
    );

    expect(complaintRepo.findOne).toHaveBeenCalledWith({
      where: { complaint_id: Number(complaintId) },
      relations: ['creator_user'],
    });
  });
  it('should throw not found error when user not found', async () => {
    const userId = '1';
    const complaintId = '1';

    const fakeComplaint = {
      complaint_id: 1,
      complaint_status: 'pending',
      complaint_type: 'general',
      created_at: new Date(),
      creator_user: {
        user_email: 'ezz@gmail.com',
        profilePicture: 'any.jpg',
        user_id: 1,
        user_name: 'ezz',
      },
    };
    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    rolesRepo.findOne.mockResolvedValue(null);

    await expect(service.deleteComplaint(userId, complaintId)).rejects.toThrow(
      new NotFoundException('user not found'),
    );

    expect(complaintRepo.findOne).toHaveBeenCalledWith({
      where: { complaint_id: Number(complaintId) },
      relations: ['creator_user'],
    });
    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where: { users: { user_id: Number(userId) } },
      relations: ['users'],
    });
  });
});

describe('ComplaintService - List User Complaints', () => {
  let service: ComplaintService;

  let userRepo: {
    findOne: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
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
    };
    groupRepo = {
      findOne: jest.fn(),
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
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    jest.spyOn(EmailUtils, 'sendComplaintEmail').mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintService,

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
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<ComplaintService>(ComplaintService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //list user complaints
  it('should throw not found error when the user not found', async () => {
    const id = '1';

    userRepo.findOne.mockResolvedValue(null);

    await expect(service.listUsrComplaints(id)).rejects.toThrow(
      new NotFoundException(' user not found '),
    );
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(id) },
    });
  });
  it('should return all the user complaints', async () => {
    const id = '1';
    const fakeUser = {
      user_id: 1,
      useR_name: 'ezz',
      user_email: 'ezz@gmail.com',
    };
    const fakeComplaints = [
      {
        complaint_id: 1,
        complaint_status: 'pending',
        complaint_type: 'general',
        created_at: new Date(),
        creator_user: {
          user_email: 'ezz@gmail.com',
          profilePicture: 'any.jpg',
          user_id: 1,
          user_name: 'ezz',
        },
      },
    ];
    userRepo.findOne.mockResolvedValue(fakeUser);
    complaintRepo.find.mockResolvedValue(fakeComplaints);

    const result = await service.listUsrComplaints(id);
    const expectedComplaints = plainToInstance(
      ComplaintOutputDto,
      fakeComplaints,
      { excludeExtraneousValues: true },
    );
    expect(result.success).toBe(true);
    expect(result.complaints).toMatchObject(expectedComplaints);
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(id) },
    });
    expect(complaintRepo.find).toHaveBeenCalledWith({
      where: { creator_user: { user_id: Number(id) } },
      relations: ['creator_user'],
      select: {
        complaint_id: true,
        complaint_status: true,
        complaint_type: true,
        created_at: true,
        creator_user: {
          user_name: true,
          user_email: true,
          user_id: true,
          user_password: false,
          user_role: false,
        },
      },
    });
  });
});

describe('ComplaintService - Delete Complaint', () => {
  let service: ComplaintService;

  let userRepo: {
    findOne: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
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
    };
    groupRepo = {
      findOne: jest.fn(),
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
    };
    complaintgroupsRuleRepo = {
      findOne: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    jest.spyOn(EmailUtils, 'sendComplaintEmail').mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintService,

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
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<ComplaintService>(ComplaintService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //delete complaint
  it('should throw bad request error when the ids are not valid', async () => {
    const userId = 'a';
    const complaintId = 'e';
    await expect(service.deleteComplaint(userId, '1')).rejects.toThrow(
      new BadRequestException('Invalid userId or complaintId'),
    );

    await expect(service.deleteComplaint('1', complaintId)).rejects.toThrow(
      new BadRequestException('Invalid userId or complaintId'),
    );
  });
  it('should throw not found error when complaint not found', async () => {
    const userId = '1';
    const complaintId = '1';

    complaintRepo.findOne.mockResolvedValue(null);

    await expect(service.deleteComplaint(userId, complaintId)).rejects.toThrow(
      new NotFoundException('complaint not found'),
    );

    expect(complaintRepo.findOne).toHaveBeenCalledWith({
      where: { complaint_id: Number(complaintId) },
      relations: ['creator_user'],
    });
  });
  it('should throw not found error when user not found', async () => {
    const userId = '1';
    const complaintId = '1';

    const fakeComplaint = {
      complaint_id: 1,
      complaint_status: 'pending',
      complaint_type: 'general',
      created_at: new Date(),
      creator_user: {
        user_email: 'ezz@gmail.com',
        profilePicture: 'any.jpg',
        user_id: 1,
        user_name: 'ezz',
      },
    };
    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    rolesRepo.findOne.mockResolvedValue(null);

    await expect(service.deleteComplaint(userId, complaintId)).rejects.toThrow(
      new NotFoundException('user not found'),
    );

    expect(complaintRepo.findOne).toHaveBeenCalledWith({
      where: { complaint_id: Number(complaintId) },
      relations: ['creator_user'],
    });
    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where: { users: { user_id: Number(userId) } },
      relations: ['users'],
    });
  });
});
