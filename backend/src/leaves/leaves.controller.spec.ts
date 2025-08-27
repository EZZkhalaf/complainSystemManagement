import { Test, TestingModule } from '@nestjs/testing';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { getRandomValues } from 'crypto';
import { UserEntity } from 'src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeavesEntity } from './entities/leaves.entity';
import { GroupEntity } from 'src/groups/entities/group.entity';

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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeavesController],
      providers: [
        // { provide: LeavesService, useValue: leavesService },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(LeavesEntity), useValue: leavesRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: groupRepo },
      ],
    }).compile();

    controller = module.get<LeavesController>(LeavesController);
    leavesService = module.get<LeavesService>(LeavesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
