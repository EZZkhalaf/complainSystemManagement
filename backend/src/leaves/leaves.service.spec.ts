import { Test, TestingModule } from '@nestjs/testing';
import { LeavesService } from './leaves.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { LeavesEntity, LeaveType } from './entities/leaves.entity';
import { AddLeaveDto } from './dtos/add-leave.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LeavesService', () => {
  let service: LeavesService;
  let userRepo : {
    findOne : jest.Mock
  }
  let leavesRepo : {
    findOne : jest.Mock,
    create : jest.Mock ,
    save : jest.Mock
  }
  beforeEach(async () => {

    userRepo = {
      findOne : jest.fn(),
    }
    leavesRepo = {
      findOne : jest.fn(),
      create : jest.fn() ,
      save : jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        {provide : getRepositoryToken(UserEntity) , useValue:userRepo},
        {provide : getRepositoryToken(LeavesEntity) , useValue:leavesRepo},
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
  let userRepo : {
    findOne : jest.Mock
  }
  let leavesRepo : {
    findOne : jest.Mock,
    create : jest.Mock ,
    save : jest.Mock
  }
  beforeEach(async () => {

    userRepo = {
      findOne : jest.fn(),
    }
    leavesRepo = {
      findOne : jest.fn(),
      create : jest.fn() ,
      save : jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        {provide : getRepositoryToken(UserEntity) , useValue:userRepo},
        {provide : getRepositoryToken(LeavesEntity) , useValue:leavesRepo},
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw bad request when the description is empty', async () => {
    const id = "1";
    const dto : AddLeaveDto = {leave_description : "" , leave_type : "wrong" as LeaveType}

    await expect(service.createLeave(id , dto)).rejects.toThrow(
      new BadRequestException("Leave description cannot be empty")
    )
  });
  it('should throw bad request when the type is invalid or empty', async () => {
    const id = "1";
    const dto : AddLeaveDto = {leave_description : "testing" , leave_type : "wrong" as LeaveType}

    await expect(service.createLeave(id , dto)).rejects.toThrow(
      new BadRequestException("Invalid leave type")
    )
  });
  it('should throw not found exception when user not found', async () => {
    const id = "1";
    const dto : AddLeaveDto = {leave_description : "testing" , leave_type : "general" as LeaveType}

    userRepo.findOne.mockResolvedValue(null);

    await expect(service.createLeave(id , dto)).rejects.toThrow(
      new NotFoundException("user not found")
    )
    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(id)}
      }
    )
  });
  it('should throw not found exception when user not found', async () => {
    const id = "1";
    const dto : AddLeaveDto = {leave_description : "testing" , leave_type : "general" as LeaveType}
    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz",
      user_email : "ezz@gmail.com"
    }
    const fakeLeave = {
      leave_description : dto.leave_description,
      leave_type : dto.leave_type,
      leave_status : 'pending',
      leave_user : fakeUser ,
    }
    userRepo.findOne.mockResolvedValue(fakeUser);
    leavesRepo.create.mockReturnValue(fakeLeave)
    leavesRepo.save.mockResolvedValue(fakeLeave)
    const result = await service.createLeave(id , dto );
    expect(result.success).toBe(true);
    expect(result.message).toEqual("leave created successfully")
    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(id)}
      }
    )
    expect(leavesRepo.create).toHaveBeenCalledWith(
      {
        leave_description: dto.leave_description,
        leave_type : dto.leave_type,
        leave_user: fakeUser
      }
    )
    expect(leavesRepo.save).toHaveBeenCalledWith(fakeLeave)
  });
});
