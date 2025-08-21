import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintController } from './complaint.controller';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ComplaintService } from './complaint.service';
import { ComplaintEntity } from './entities/complaint.entity';
import { LogsService } from '../logs/logs.service';
import { ComplaintGroupsRuleEntity } from './entities/complaint-groups-rule.entity';
import { RolesEntity } from '../roles/entities/roles.entity';
import { CheckTokenGaurd } from '../gaurds/check-token-gaurd.gaurd';
import { CheckPermissionGaurd } from '../gaurds/check-permission.gaurd';

describe('ComplaintController', () => {
  let controller: ComplaintController;
  let service : ComplaintService
  let mockComplaintService = {
    addComplaint : jest.fn(),
    handleComplaintInGroup  : jest.fn(),
    changeComplaintStatus : jest.fn(),
    listComplaints  : jest.fn(),
    getComplaintInfo  : jest.fn(),
    listUsrComplaints  : jest.fn(),
    deleteComplaint : jest.fn()
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintController],
      providers: [
        {provide :ComplaintService , useValue : mockComplaintService },
        {provide : JwtService , useValue : {}},
        {provide : getRepositoryToken(UserEntity) , useValue : {}},
        {provide : getRepositoryToken(ComplaintEntity) , useValue : {}},
        {provide : getRepositoryToken(ComplaintGroupsRuleEntity) , useValue:{}},
        {provide : getRepositoryToken(RolesEntity) , useValue : {}} ,
        {provide : LogsService , useValue : {}}
      ],
    }).overrideGuard(CheckTokenGaurd) 
        .useValue({ canActivate: jest.fn(() => true) })
        .overrideGuard(CheckPermissionGaurd) 
        .useValue({ canActivate: jest.fn(() => true) })
        .compile();

    controller = module.get<ComplaintController>(ComplaintController);
    service = module.get<ComplaintService>(ComplaintService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
