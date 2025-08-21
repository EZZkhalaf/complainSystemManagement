import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { GroupsService } from './groups.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { ComplaintEntity } from '../complaint/entities/complaint.entity';
import { UserEntity } from '../user/entities/user.entity';
import { ComplaintGroupsRuleEntity } from '../complaint/entities/complaint-groups-rule.entity';
import { LogsService } from '../logs/logs.service';
import { CheckTokenGaurd } from '../gaurds/check-token-gaurd.gaurd';
import { CheckPermissionGaurd } from '../gaurds/check-permission.gaurd';

describe('GroupsController', () => {
  let controller: GroupsController;
  let service : GroupsService
  let mockGroupsService = {
    createGroup : jest.fn(),
    removeUserFomeGroup : jest.fn() ,
    getGroupInfoAndUsers : jest.fn() ,
    deleteGroup : jest.fn(),
    getUserGroups : jest.fn() ,
    listGroups : jest.fn(),
    listGroupComplaints:jest.fn() ,
    searchGroups : jest.fn() ,
    addGroupToRule : jest.fn() ,
    removeGroupFromRule : jest.fn() ,
    getRules : jest.fn()
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        { provide: GroupsService, useValue: mockGroupsService },
        { provide: JwtService, useValue: {} },
        { provide: getRepositoryToken(GroupEntity), useValue: {} },
        { provide: getRepositoryToken(UserEntity), useValue: {} },
        { provide: getRepositoryToken(ComplaintGroupsRuleEntity), useValue: {} },
        { provide: getRepositoryToken(ComplaintEntity), useValue: {} },
        { provide: LogsService, useValue: {} },
      ],
    })    
    .overrideGuard(CheckTokenGaurd) 
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(CheckPermissionGaurd) 
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();


    controller = module.get<GroupsController>(GroupsController);
    service = module.get<GroupsService>(GroupsService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
