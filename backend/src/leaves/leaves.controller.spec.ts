import { Test, TestingModule } from '@nestjs/testing';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { getRandomValues } from 'crypto';
import { UserEntity } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeavesEntity } from './entities/leaves.entity';
import { GroupEntity } from '../groups/entities/group.entity';
import { LogsService } from '../logs/logs.service';

describe('LeavesController', () => {
  let controller: LeavesController;
  let leavesService: LeavesService;
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
    groupRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    leavesRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findAndCount: jest.fn(),
    };
    logsService = {
      logAction: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeavesController],
      providers: [
        LeavesService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(LeavesEntity), useValue: leavesRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
        { provide: LogsService, useValue: logsService },
      ],
    }).compile();

    controller = module.get<LeavesController>(LeavesController);
    leavesService = module.get<LeavesService>(LeavesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
