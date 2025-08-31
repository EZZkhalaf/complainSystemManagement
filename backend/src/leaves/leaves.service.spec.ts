import { Test, TestingModule } from '@nestjs/testing';
import { LeavesService } from './leaves.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { LeavesEntity, LeaveStatus, LeaveType } from './entities/leaves.entity';
import { AddLeaveDto } from './dtos/add-leave.dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GroupEntity } from '../groups/entities/group.entity';
import { Between, ILike } from 'typeorm';
import { PagingDto } from './dtos/paging.dto';
import { LeaveItemDto } from './dtos/get-user-leaves.dto';
import { format } from 'date-fns';
import { PaginAndFilterDto } from './dtos/paging-and-filter.dto';
import { LogsService } from '../logs/logs.service';
import * as EmailUtils from '../utils/email.util';

jest.mock('../utils/email.util', () => ({
  sendEmail: jest.fn(),
}));

describe('LeavesService', () => {
  let service: LeavesService;
  let userRepo: {
    findOne: jest.Mock;
  };
  let leavesRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };
  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
    };
    leavesRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    logsService = {
      logAction: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(LeavesEntity), useValue: leavesRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: {} },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('LeavesService - add leave test case', () => {
  let service: LeavesService;
  let userRepo: {
    findOne: jest.Mock;
  };
  let leavesRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };
  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
    };
    leavesRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    logsService = {
      logAction: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(LeavesEntity), useValue: leavesRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: {} },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw bad request when the description is empty', async () => {
    const id = '1';
    const dto: AddLeaveDto = {
      leave_description: '',
      leave_type: 'wrong' as LeaveType,
    };

    await expect(service.createLeave(id, dto)).rejects.toThrow(
      new BadRequestException('Leave description cannot be empty'),
    );
  });
  it('should throw bad request when the type is invalid or empty', async () => {
    const id = '1';
    const dto: AddLeaveDto = {
      leave_description: 'testing',
      leave_type: 'wrong' as LeaveType,
    };

    await expect(service.createLeave(id, dto)).rejects.toThrow(
      new BadRequestException('Invalid leave type'),
    );
  });
  it('should throw not found exception when user not found', async () => {
    const id = '1';
    const dto: AddLeaveDto = {
      leave_description: 'testing',
      leave_type: 'general' as LeaveType,
    };

    userRepo.findOne.mockResolvedValue(null);

    await expect(service.createLeave(id, dto)).rejects.toThrow(
      new NotFoundException('user not found'),
    );
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(id) },
    });
  });
  it('should throw not found exception when user not found', async () => {
    const id = '1';
    const dto: AddLeaveDto = {
      leave_description: 'testing',
      leave_type: 'general' as LeaveType,
    };
    const fakeUser = {
      user_id: 1,
      user_name: 'ezz',
      user_email: 'ezz@gmail.com',
    };
    const fakeLeave = {
      leave_description: dto.leave_description,
      leave_type: dto.leave_type,
      leave_status: 'pending',
      leave_user: fakeUser,
    };
    userRepo.findOne.mockResolvedValue(fakeUser);
    leavesRepo.create.mockReturnValue(fakeLeave);
    leavesRepo.save.mockResolvedValue(fakeLeave);
    const result = await service.createLeave(id, dto);
    expect(result.success).toBe(true);
    expect(result.message).toEqual('leave created successfully');
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(id) },
    });
    expect(leavesRepo.create).toHaveBeenCalledWith({
      leave_description: dto.leave_description,
      leave_type: dto.leave_type,
      leave_user: fakeUser,
    });
    expect(leavesRepo.save).toHaveBeenCalledWith(fakeLeave);
  });
});

describe('LeavesService - change leave status', () => {
  let service: LeavesService;
  let userRepo: {
    findOne: jest.Mock;
  };
  let leavesRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };
  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
    };
    leavesRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    logsService = {
      logAction: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(LeavesEntity), useValue: leavesRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: {} },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw bad request when the ids are not valid number string ', async () => {
    const dto = { new_state: 'accept', leave_handler_id: 'aa' };
    const leave_id = '1';

    await expect(service.changeLeaveState(leave_id, dto)).rejects.toThrow(
      new BadRequestException('invalid id format'),
    );

    await expect(service.changeLeaveState('aa', dto)).rejects.toThrow(
      new BadRequestException('invalid id format'),
    );
  });
  it('should throw not found exception when the leave is not found ', async () => {
    const dto = { new_state: 'accept', leave_handler_id: '1' };
    const leave_id = '1';

    leavesRepo.findOne.mockResolvedValue(null);

    await expect(service.changeLeaveState(leave_id, dto)).rejects.toThrow(
      new NotFoundException('leave not found '),
    );

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user'],
      select: {
        leave_description: true,
        leave_id: true,
        leave_type: true,
        leave_status: true,
        leave_user: {
          user_id: true,
          user_password: false,
          user_name: true,
          user_email: true,
        },
      },
    });
  });
  it('should throw not found exception when the user is not found ', async () => {
    const dto = { new_state: 'accept', leave_handler_id: '1' };
    const leave_id = '1';
    const fakeLeave = {
      leave_description: 'sick leave',
      leave_id: 1,
      leave_type: 'general',
      leave_status: 'pending',
      leave_user: {
        user_id: 1,

        user_name: 'ezz',
      },
    };
    leavesRepo.findOne.mockResolvedValue(fakeLeave);
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.changeLeaveState(leave_id, dto)).rejects.toThrow(
      new NotFoundException('user not found'),
    );

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user'],
      select: {
        leave_description: true,
        leave_id: true,
        leave_type: true,
        leave_status: true,
        leave_user: {
          user_id: true,
          user_password: false,
          user_name: true,
          user_email: true,
        },
      },
    });

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(dto.leave_handler_id) },
      select: {
        user_id: true,
        user_password: false,
        user_name: true,
      },
    });
  });
  it('should throw bad request when the new state is not valid for the leave  ', async () => {
    const dto = { new_state: 'wrong', leave_handler_id: '2' };
    const leave_id = '1';
    const fakeLeave = {
      leave_description: 'sick leave',
      leave_id: 1,
      leave_type: 'general',
      leave_status: 'pending',
      leave_user: {
        user_id: 1,
        user_name: 'ezz',
      },
    };
    const fakeUser = {
      user_id: 2,
      user_name: 'ezz',
    };
    leavesRepo.findOne.mockResolvedValue(fakeLeave);
    userRepo.findOne.mockResolvedValue(fakeUser);

    await expect(service.changeLeaveState(leave_id, dto)).rejects.toThrow(
      new BadRequestException('Invalid leave status'),
    );

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user'],
      select: {
        leave_description: true,
        leave_id: true,
        leave_type: true,
        leave_status: true,
        leave_user: {
          user_id: true,
          user_password: false,
          user_name: true,
          user_email: true,
        },
      },
    });

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(dto.leave_handler_id) },
      select: {
        user_id: true,
        user_password: false,
        user_name: true,
      },
    });
  });
  it('should change the state of the leave and add the leave handler user to the leave columns in the db', async () => {
    const dto = { new_state: 'accepted', leave_handler_id: '2' };
    const leave_id = '1';
    const fakeLeave = {
      leave_description: 'sick leave',
      leave_id: 1,
      leave_type: 'general',
      leave_status: 'pending',
      leave_user: {
        user_id: 1,
        user_name: 'ezz',
        user_email: 'ezz@gmail.com',
      },
      leave_handler: null,
    };
    const fakeUser = {
      user_id: 2,
      user_name: 'ezz',
    };
    const updatedLeave = {
      ...fakeLeave,
      leave_status: dto.new_state,
      leave_handler: fakeUser,
    };
    leavesRepo.findOne.mockResolvedValue(fakeLeave);
    userRepo.findOne.mockResolvedValue(fakeUser);
    leavesRepo.save.mockResolvedValue(updatedLeave);

    const result = await service.changeLeaveState(leave_id, dto);
    expect(result.success).toBe(true);
    expect(result.message).toEqual('leave state updated successfully');
    expect(result.leave).toEqual(updatedLeave);

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user'],
      select: {
        leave_description: true,
        leave_id: true,
        leave_type: true,
        leave_status: true,
        leave_user: {
          user_id: true,
          user_password: false,
          user_name: true,
          user_email: true,
        },
      },
    });

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(dto.leave_handler_id) },
      select: {
        user_id: true,
        user_password: false,
        user_name: true,
      },
    });

    expect(leavesRepo.save).toHaveBeenCalled();

    expect(EmailUtils.sendEmail).toHaveBeenCalledWith(
      fakeLeave.leave_user.user_email,
      'Leave Update',
      `Your Leave has been ${dto.new_state}`,
    );

    expect(logsService.logAction).toHaveBeenCalledWith(
      fakeUser,
      'Leave-Action',
      'Leave',
      fakeUser.user_id,
      `${dto.new_state} ${fakeLeave.leave_user.user_name} leave `,
    );
  });
});

describe('LeavesService - get leave info ', () => {
  let service: LeavesService;
  let userRepo: {
    findOne: jest.Mock;
  };
  let leavesRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };
  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
    };
    leavesRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    logsService = {
      logAction: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(LeavesEntity), useValue: leavesRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: {} },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw bad request when the id are not valid number string ', async () => {
    const leave_id = 'asda11';

    await expect(service.getLeave(leave_id)).rejects.toThrow(
      new BadRequestException('leave is is invalid'),
    );
  });
  it('should throw not found exception when leave not found', async () => {
    const leave_id = '1';

    leavesRepo.findOne.mockResolvedValue(null);

    await expect(service.getLeave(leave_id)).rejects.toThrow(
      new NotFoundException('leave not found'),
    );

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user', 'leave_handler'],
      select: {
        leave_description: true,
        leave_handler: {
          user_email: true,
          user_name: true,
          user_password: false,
          user_id: true,
        },
        leave_user: {
          user_id: true,
          user_name: true,
          user_email: true,
          user_password: false,
        },
        leave_type: true,
        leave_status: true,
      },
    });
  });
  it('should return all the leave info ', async () => {
    const leave_id = '1';
    const fakeLeave = {
      leave_description: 'testing',
      leave_handler: {
        user_email: 'ezz@gmail.com',
        user_name: 'ezz',
        user_id: 1,
      },
      leave_user: {
        user_id: 2,
        user_name: 'ezz2',
        user_email: 'ezz2@gmail.com',
      },
      leave_type: 'general',
      leave_status: 'pending',
    };
    leavesRepo.findOne.mockResolvedValue(fakeLeave);

    const result = await service.getLeave(leave_id);

    expect(result.success).toBe(true);
    expect(result.leave).toMatchObject(fakeLeave);

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user', 'leave_handler'],
      select: {
        leave_description: true,
        leave_handler: {
          user_email: true,
          user_name: true,
          user_password: false,
          user_id: true,
        },
        leave_user: {
          user_id: true,
          user_name: true,
          user_email: true,
          user_password: false,
        },
        leave_type: true,
        leave_status: true,
      },
    });
  });
});

describe('LeavesService - delete leave ', () => {
  let service: LeavesService;
  let userRepo: {
    findOne: jest.Mock;
  };
  let leavesRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };
  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
    };
    leavesRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    logsService = {
      logAction: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(LeavesEntity), useValue: leavesRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw bad request when the id are not valid number string ', async () => {
    const leave_id = '1';
    const user_id = '1';

    await expect(service.deleteLeave(leave_id, 'aa')).rejects.toThrow(
      new BadRequestException('invalid ids format'),
    );

    await expect(service.deleteLeave('ff', user_id)).rejects.toThrow(
      new BadRequestException('invalid ids format'),
    );
  });
  it('should throw not found error when the leave is not found ', async () => {
    const leave_id = '1';
    const user_id = '1';

    leavesRepo.findOne.mockResolvedValue(null);
    await expect(service.deleteLeave(leave_id, user_id)).rejects.toThrow(
      new NotFoundException('leave not found'),
    );

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user'],
      select: {
        leave_description: true,
        leave_id: true,
        leave_user: {
          user_id: true,
          user_password: false,
        },
      },
    });
  });
  it('should throw not found error when the user doesnt exists', async () => {
    const leave_id = '1';
    const user_id = '1';

    const fakeLeave = {
      leave_description: 'tresing',
      leave_id: 1,
      leave_user: {
        user_id: 1,
      },
    };
    leavesRepo.findOne.mockResolvedValue(fakeLeave);
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.deleteLeave(leave_id, user_id)).rejects.toThrow(
      new NotFoundException('user not found'),
    );

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user'],
      select: {
        leave_description: true,
        leave_id: true,
        leave_user: {
          user_id: true,
          user_password: false,
        },
      },
    });
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(user_id) },
    });
  });
  it('should delete the leave if the user was the user who requested the leave ', async () => {
    const leave_id = '1';
    const user_id = '1';

    const fakeUser = {
      user_id: 1,
    };
    const fakeLeave = {
      leave_description: 'tresing',
      leave_id: 1,
      leave_user: fakeUser,
    };
    leavesRepo.findOne.mockResolvedValue(fakeLeave);
    userRepo.findOne.mockResolvedValue(fakeUser);
    leavesRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

    const result = await service.deleteLeave(leave_id, user_id);
    expect(result.success).toBe(true);
    expect(result.message).toEqual(
      'the leave has been deleted successfully by its own user',
    );

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user'],
      select: {
        leave_description: true,
        leave_id: true,
        leave_user: {
          user_id: true,
          user_password: false,
        },
      },
    });
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(user_id) },
    });
    expect(leavesRepo.delete).toHaveBeenCalled();
  });
  it('should throw not found error when the hr department not found to handle the deletion process', async () => {
    const leave_id = '1';
    const user_id = '1';

    const fakeUser = {
      user_id: 1,
    };
    const fakeLeave = {
      leave_description: 'tresing',
      leave_id: 1,
      leave_user: {
        user_id: 2,
      },
    };
    leavesRepo.findOne.mockResolvedValue(fakeLeave);
    userRepo.findOne.mockResolvedValue(fakeUser);
    groupRepo.findOne.mockResolvedValue(null);

    await expect(service.deleteLeave(leave_id, user_id)).rejects.toThrow(
      new NotFoundException('not hr group found to delete the request'),
    );

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user'],
      select: {
        leave_description: true,
        leave_id: true,
        leave_user: {
          user_id: true,
          user_password: false,
        },
      },
    });
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(user_id) },
    });
    expect(groupRepo.findOne).toHaveBeenCalledWith({
      where: { group_name: ILike('hr') },
      relations: ['users'],
      select: {
        group_id: true,
        group_name: true,
        users: {
          user_id: true,
          user_password: false,
        },
      },
    });
  });
  it('should throw forbidden exception  error when the user is neither the leave owner or in the hr group to delete the leave ', async () => {
    const leave_id = '1';
    const user_id = '1';

    const fakeUser = {
      user_id: 1,
    };
    const fakeLeave = {
      leave_description: 'tresing',
      leave_id: 1,
      leave_user: {
        user_id: 2,
      },
    };
    const fakeGroup = {
      group_id: 1,
      group_name: 'hr',
      users: [
        {
          user_id: 6,
        },
      ],
    };
    leavesRepo.findOne.mockResolvedValue(fakeLeave);
    userRepo.findOne.mockResolvedValue(fakeUser);
    groupRepo.findOne.mockResolvedValue(fakeGroup);

    await expect(service.deleteLeave(leave_id, user_id)).rejects.toThrow(
      new ForbiddenException(
        'the user must be the owner or in the HR group to delete the leave',
      ),
    );

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user'],
      select: {
        leave_description: true,
        leave_id: true,
        leave_user: {
          user_id: true,
          user_password: false,
        },
      },
    });
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(user_id) },
    });
    expect(groupRepo.findOne).toHaveBeenCalledWith({
      where: { group_name: ILike('hr') },
      relations: ['users'],
      select: {
        group_id: true,
        group_name: true,
        users: {
          user_id: true,
          user_password: false,
        },
      },
    });
  });
  it('should delete the leave when matches all the cases and the user is in the hr group ', async () => {
    const leave_id = '1';
    const user_id = '5';

    const fakeUser = {
      user_id: 5,
    };
    const fakeLeave = {
      leave_description: 'tresing',
      leave_id: 1,
      leave_user: {
        user_id: 2,
      },
    };
    const fakeGroup = {
      group_id: 1,
      group_name: 'hr',
      users: [
        {
          user_id: 5,
        },
      ],
    };
    leavesRepo.findOne.mockResolvedValue(fakeLeave);
    userRepo.findOne.mockResolvedValue(fakeUser);
    groupRepo.findOne.mockResolvedValue(fakeGroup);
    leavesRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

    const result = await service.deleteLeave(leave_id, user_id);
    expect(result.success).toBe(true);
    expect(result.message).toEqual(
      'the leave has been deleted successfully by HR group',
    );

    expect(leavesRepo.findOne).toHaveBeenCalledWith({
      where: { leave_id: Number(leave_id) },
      relations: ['leave_user'],
      select: {
        leave_description: true,
        leave_id: true,
        leave_user: {
          user_id: true,
          user_password: false,
        },
      },
    });
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(user_id) },
    });
    expect(groupRepo.findOne).toHaveBeenCalledWith({
      where: { group_name: ILike('hr') },
      relations: ['users'],
      select: {
        group_id: true,
        group_name: true,
        users: {
          user_id: true,
          user_password: false,
        },
      },
    });
    expect(leavesRepo.delete).toHaveBeenCalledWith(fakeLeave.leave_id);
  });
});

describe('LeavesService - get user leaves ', () => {
  let service: LeavesService;
  let userRepo: {
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let leavesRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
    findAndCount: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };
  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    leavesRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findAndCount: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(LeavesEntity), useValue: leavesRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw bad request when the id are not valid number string ', async () => {
    const userId = 'aa';
    const dto: PagingDto = { currentPage: '1', leavesPerPage: '8' };
    await expect(service.getUserLeaves(userId, dto)).rejects.toThrow(
      new BadRequestException('user id is invalid'),
    );
  });
  it('should throw bad request when the paging input is invalid ', async () => {
    const userId = '1';
    const dto: PagingDto = { currentPage: '1', leavesPerPage: '8' };
    const invalidDtos: PagingDto[] = [
      { currentPage: 'abc', leavesPerPage: '5' }, // currentPage not a number
      { currentPage: '1', leavesPerPage: 'xyz' }, // leavesPerPage not a number
      { currentPage: '-1', leavesPerPage: '5' }, // currentPage negative
      { currentPage: '1', leavesPerPage: '-10' }, // leavesPerPage negative
    ];

    for (const dto of invalidDtos) {
      await expect(service.getUserLeaves(userId, dto)).rejects.toThrow(
        new BadRequestException('error in the input page'),
      );
    }
  });

  it('should throw not found exception when the user not found ', async () => {
    const userId = '1';
    const dto: PagingDto = { currentPage: '1', leavesPerPage: '8' };
    const skip = (Number(dto.currentPage) - 1) * Number(dto.leavesPerPage);
    const take = Number(dto.leavesPerPage);

    userRepo.findOne.mockResolvedValue(null);

    await expect(service.getUserLeaves(userId, dto)).rejects.toThrow(
      new NotFoundException('user not found'),
    );

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(userId) },
      select: ['user_id', 'user_name'],
    });
  });
  it('should throw not found exception when the user not found ', async () => {
    const userId = '1';
    const dto: PagingDto = { currentPage: '1', leavesPerPage: '8' };
    const skip = (Number(dto.currentPage) - 1) * Number(dto.leavesPerPage);
    const take = Number(dto.leavesPerPage);
    const fakeUser = { user_id: 1, user_name: 'John Doe' } as UserEntity;
    const fakeLeaves = [
      {
        leave_id: 101,
        leave_description: 'Vacation',
        leave_status: 'accepted',
        leave_type: LeaveType.SICK,
        created_at: new Date('2025-08-20T10:00:00Z'),
        updated_at: new Date('2025-08-22T15:00:00Z'),
        leave_user: { user_name: 'John Doe' },
        leave_handler: { user_name: 'Admin' },
      },
    ];

    userRepo.findOne.mockResolvedValue(fakeUser);
    leavesRepo.findAndCount.mockResolvedValue([fakeLeaves, 10]);

    const result = await service.getUserLeaves(userId, dto);

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(userId) },
      select: ['user_id', 'user_name'],
    });

    expect(leavesRepo.findAndCount).toHaveBeenCalledWith({
      where: { leave_user: { user_id: Number(userId) } },
      relations: ['leave_user', 'leave_handler'],
      order: { created_at: 'DESC' },
      skip: skip,
      take: take,
    });

    expect(result).toEqual({
      user_id: fakeUser.user_id,
      user_name: fakeUser.user_name,
      leaves: [
        {
          leave_id: 101,
          leave_description: 'Vacation',
          leave_status: fakeLeaves[0].leave_status, // accepted
          leave_type: fakeLeaves[0].leave_type, // sick
          created_at: format(fakeLeaves[0].created_at, 'yyyy-MM-dd HH:mm'),
          updated_at: format(fakeLeaves[0].updated_at, 'yyyy-MM-dd HH:mm'),
          leave_user_name: 'John Doe',
          leave_handler_name: 'Admin',
        },
      ],
      currentPage: Number(dto.currentPage),
      leavesPerPage: Number(dto.leavesPerPage),
      totalLeaves: 10,
    });
  });
});

describe('LeavesService - get all leaves ', () => {
  let service: LeavesService;
  let userRepo: {
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let leavesRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
    findAndCount: jest.Mock;
  };
  let groupRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let logsService: {
    logAction: jest.Mock;
  };
  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    leavesRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findAndCount: jest.fn(),
    };
    groupRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    logsService = {
      logAction: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(LeavesEntity), useValue: leavesRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw bad request when the paging inputs are invalid', async () => {
    const invalidDtos: PaginAndFilterDto[] = [
      { currentPage: 'abc', leavesPerPage: '5' }, // currentPage not a number
      { currentPage: '1', leavesPerPage: 'xyz' }, // leavesPerPage not a number
      { currentPage: '-1', leavesPerPage: '5' }, // currentPage negative
      { currentPage: '1', leavesPerPage: '-10' }, // leavesPerPage negative
    ];

    for (const dto of invalidDtos) {
      await expect(service.getLeaves(dto)).rejects.toThrow(
        new BadRequestException('error in the input page'),
      );
    }
  });

  it('should fetch the leaves , a few of them in time ', async () => {
    const dto: PaginAndFilterDto = {
      currentPage: '1',
      leavesPerPage: '2',
      leave_status: LeaveStatus.PENDING,
      leave_type: LeaveType.SICK,
      date_from: '2025-08-20',
      date_to: '2025-08-25',
    };
    const skip = (Number(dto.currentPage) - 1) * Number(dto.leavesPerPage);
    const take = Number(dto.leavesPerPage);

    const fakeLeaves: LeavesEntity[] = [
      {
        leave_id: 1,
        leave_description: 'Sick leave',
        leave_status: LeaveStatus.PENDING,
        leave_type: LeaveType.SICK,
        created_at: new Date('2025-08-21T10:00:00Z'),
        updated_at: new Date('2025-08-21T12:00:00Z'),
        leave_user: { user_name: 'John Doe' } as any,
        leave_handler: { user_name: 'Admin' } as any,
      },
      {
        leave_id: 2,
        leave_description: 'Sick leave 2',
        leave_status: LeaveStatus.PENDING,
        leave_type: LeaveType.SICK,
        created_at: new Date('2025-08-22T10:00:00Z'),
        updated_at: new Date('2025-08-22T12:00:00Z'),
        leave_user: { user_name: 'Jane Doe' } as any,
        leave_handler: { user_name: 'Admin' } as any,
      },
    ];

    leavesRepo.findAndCount.mockResolvedValue([fakeLeaves, 10]);

    const result = await service.getLeaves(dto);

    expect(leavesRepo.findAndCount).toHaveBeenCalledWith({
      where: {
        leave_status: dto.leave_status,
        leave_type: dto.leave_type,
        created_at: Between(new Date(dto.date_from), new Date(dto.date_to)),
      },
      order: { created_at: 'DESC' },
      skip,
      take,
      relations: ['leave_user', 'leave_handler'],
    });

    expect(result).toEqual({
      currentPage: 1,
      leavesPerPage: 2,
      totalLeaves: 10,
      leaves: fakeLeaves.map((leave) => ({
        leave_id: leave.leave_id,
        leave_description: leave.leave_description,
        leave_status: leave.leave_status,
        leave_type: leave.leave_type,
        created_at: format(leave.created_at, 'yyyy-MM-dd HH:mm'),
        updated_at: format(leave.updated_at, 'yyyy-MM-dd HH:mm'),
        leave_user_name: leave.leave_user.user_name,
        leave_handler_name: leave.leave_handler.user_name,
      })),
    });
  });
});
