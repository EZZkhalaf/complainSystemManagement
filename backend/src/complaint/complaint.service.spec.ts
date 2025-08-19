

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

describe('ComplaintService', () => {
  let service: ComplaintService;

  let userRepo :{
    findOne : jest.Mock ,

  }
  let  groupRepo : {
    findOne : jest.Mock
  }
  let complaintRepo : {
    create : jest.Mock ,
    findOne : jest.Mock ,
    delete : jest.Mock , 
    save : jest.Mock
  }
  let complaintgroupsRuleRepo : {
    findOne : jest.Mock ,

  }
  let logsService : {
    logAction : jest.Mock
  }
  beforeEach(async () => {
    userRepo = {
      findOne : jest.fn()
    }
    groupRepo = {
      findOne : jest.fn()
    }
    complaintRepo = {
      create : jest.fn(),
      findOne : jest.fn() ,
      delete : jest.fn() ,
      save : jest.fn()
    }
    complaintgroupsRuleRepo = {
      findOne : jest.fn()
    }

    
    logsService = {
      logAction : jest.fn()
    }
    jest.spyOn(EmailUtils, 'sendComplaintEmail').mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintService,
         
        {provide : getRepositoryToken(UserEntity) , useValue :userRepo},
        {provide : getRepositoryToken(ComplaintEntity) , useValue :complaintRepo},
        {provide : getRepositoryToken(RolesEntity) , useValue :{}},
        {provide : getRepositoryToken(ComplaintGroupsRuleEntity) , useValue :complaintgroupsRuleRepo},
        {provide : getRepositoryToken(GroupEntity) , useValue :groupRepo},
        {provide : LogsService , useValue : logsService}
      
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
  it("should throw error when the description and usrId are empty " , async() =>{
    const dto :any ={type : 'general'}
    await expect(service.addComplaint(dto , 1)).rejects.toThrow(
      new BadRequestException('Description and userId are required')
    )
  })
  it("should throw error when the user not found" , async() =>{
    userRepo.findOne.mockResolvedValue(null)
    const dto : any = {description : "123123" , type : "technical"}
    const userId = 1
    await expect(service.addComplaint(dto , 1)).rejects.toThrow(
      new NotFoundException('User not found')
    )
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where : {user_id : 1}
    })
  })
  it("should throw error when no group found" , async() =>{
    const dto : any = {description : "123123" , type : "technical"}
    const userId = 1;
    const user = {
      user_id : 1 ,
      user_name : 'ezz' ,
      user_email : "test@gmail.com",
      profilePicture : "any.jpg"
    }

    userRepo.findOne.mockResolvedValue(user);
    await expect(service.addComplaint(dto , userId)).rejects.toThrow(
      new NotFoundException('No default group to take the complaint')
    )
    expect(groupRepo.findOne).toHaveBeenCalledWith(
      {
        where : {group_name : "HR"}
      }
    )
  })
  it("create a new complaint and save it and then return the success message" , async() =>{
    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz",
      user_email : "test@gmail.com",
      profilePicture : "any.jpg"
    }
    const fakeGroup = {
      group_id : 1 ,
      group_name : "HR" ,
      created_at : new Date()
    }
    const dto : any = {type : 'technical' , description : "testing the description"}
    userRepo.findOne.mockResolvedValue(fakeUser);
    groupRepo.findOne.mockResolvedValue(fakeGroup);
    complaintRepo.create.mockReturnValue({
      description : dto.description,
      complaint_type: dto.type,
      creator_user: fakeUser,
      groupsQueue: [fakeGroup]
    })
    complaintRepo.save.mockResolvedValue(true)

    const result = await service.addComplaint(dto , 1)
    
    expect(result).toEqual({
            success: true,
            message: 'Complaint added successfully',
        })
  })


  //handle complaint in the group
  it("should throw an error when the complaint not found" , async()=>{
    const dto : any = {userId : "123" , status : "accept"}
    complaintRepo.findOne.mockResolvedValue(null);

    expect(service.handleComplaintInGroup("1" , dto)).rejects.toThrow(
      new NotFoundException('Complaint not found')
    )
  })
  it("should throw error when no groups in the complaint rule found" , async() =>{
    const dto : any = {userId : "123" , status : "accept"}
    const fakeComplaint = {
      complaint_id : 1 ,
      complaint_user : "user" ,
      description : "complaint description",
      complaint_status : "technical",
      groupsQueue : []
    }

    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue({user_id : "1"})
    complaintgroupsRuleRepo.findOne.mockResolvedValue(null)

    const result = await service.handleComplaintInGroup('1' , dto)
    expect(result.status).toBe(500)

  })
  it("should throw error when the complaint is already handeled" , async() =>{
    const dto : any = {userId : "123" , status : "accept"}
    const fakeComplaint = {
      complaint_id : 1 ,
      creator_user : {user_id : 1, user_email: 'test@test.com', user_name: 'John' } ,
      description : "complaint description",
      complaint_status : "technical",
      groupsQueue : ["groupA" , "groupB"]
    }
    const fakeGroups = ["groupA"] 
    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue({user_id : 1 , user_email: 'test@test.com', user_name: 'John'})
    complaintgroupsRuleRepo.findOne.mockResolvedValue({groups : fakeGroups})

    const result = await service.handleComplaintInGroup('1' , dto)
    expect(result.status).toBe(400)
    expect(result.body.message).toBe('Complaint already handled')
  })
  it("should throw new error when the complaint is already handeled before with the current group" , async() =>{
    const dto : any = {userId : "123" , status : "accept"}
    const fakeComplaint = {
      complaint_id : 1 ,
      creator_user : {user_id : 1, user_email: 'test@test.com', user_name: 'John' } ,
      description : "complaint description",
      complaint_status : "technical",
      groupsQueue : ["groupA" ]
    }
    const fakeGroups = ["groupA" ,'groupA'] 
    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue({user_id : 1 , user_email: 'test@test.com', user_name: 'John'})
    complaintgroupsRuleRepo.findOne.mockResolvedValue({groups : fakeGroups})

    const result = await service.handleComplaintInGroup('1' , dto)
    expect(result.status).toBe(400)
    expect(result.body.message).toBe('Current group already handled this complaint.')
  })
  it("accepts the complaint and resolves last group", async () => {
    const dto: any = { userId: "123", status: "accept" };

    const fakeComplaint = {
      complaint_id: 1,
      creator_user: { user_id: 123, user_email: 'ezz@test.com', user_name: 'John' },
      description: "complaint description",
      complaint_status: "technical",
      groupsQueue: [], 
    };

    const fakeGroups = ["groupA"];
    
    const user = {
      user_id : 123 ,
      user_name : "ezz" ,
      useR_email : "ezz@gmail.com",
      user_password : "123456" , 
      profilePicture : ""
    }

    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue(user);
    complaintgroupsRuleRepo.findOne.mockResolvedValue({ groups: fakeGroups });

    const result = await service.handleComplaintInGroup("1", dto);

    expect(EmailUtils.sendComplaintEmail).toHaveBeenCalledWith(
      fakeComplaint.creator_user.user_email,
      expect.any(String),
      fakeComplaint.creator_user.user_name
    );




    expect(logsService.logAction).toHaveBeenCalledWith(
      user,
      'Resolve',
      'Complaint',
      1,
      'Final group resolved the complaint.'
    );


    expect(result.status).toBe(200);
    expect(result.body.message).toContain('resolved');
  });
  it("should change the compalint state to in pregress andreturn true and moves to the next groups in the rule" , async() =>{
    const dto: any = { userId: "123", status: "accept" };

    const fakeComplaint = {
      complaint_id: 1,
      creator_user: { user_id: 123, user_email: 'ezz@test.com', user_name: 'John' },
      description: "complaint description",
      complaint_status: "technical",
      groupsQueue: ['groupB'], 
    };

    const fakeGroups = [
    { group_name: "HR", user: [] } // must be object
  ];
    const fakeGroupA = {
      group_id : 1,
      group_name : "HR" ,
      user : [] 
    }
    const user = {
      user_id : 123 ,
      user_name : "ezz" ,
      useR_email : "ezz@gmail.com",
      user_password : "123456" , 
      profilePicture : ""
    }
    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue(user);
    complaintgroupsRuleRepo.findOne.mockResolvedValue({ groups: [{group_name : "HR"}] });

    const result = await service.handleComplaintInGroup("1", dto);
    expect(logsService.logAction).toHaveBeenCalledWith(
      user,
      'Accept',
      'Complaint',
        1,
      `Complaint accepted by one of the groups in the rule.`
    );
    expect(result.status).toBe(200);
    expect(result.body.message).toContain('Accepted');

  })

  it("rejects the complaint , send email , add the log " , async() =>{
     const dto: any = { userId: "123", status: "reject" };

    const fakeComplaint = {
      complaint_id: 1,
      creator_user: { user_id: 123, user_email: 'ezz@test.com', user_name: 'John' },
      description: "complaint description",
      complaint_status: "technical",
      groupsQueue: ['groupB'], 
    };

    const fakeGroups = [
    { group_name: "HR", user: [] } // must be object
  ];
    const fakeGroupA = {
      group_id : 1,
      group_name : "HR" ,
      user : [] 
    }
    const user = {
      user_id : 123 ,
      user_name : "ezz" ,
      useR_email : "ezz@gmail.com",
      user_password : "123456" , 
      profilePicture : ""
    }
    complaintRepo.findOne.mockResolvedValue(fakeComplaint);
    userRepo.findOne.mockResolvedValue(user);
    complaintgroupsRuleRepo.findOne.mockResolvedValue({ groups: [{group_name : "HR"}] });

    const result = await service.handleComplaintInGroup("1", dto);

    expect(EmailUtils.sendComplaintEmail).toHaveBeenCalledWith(
      fakeComplaint.creator_user.user_email,
      expect.any(String),
      fakeComplaint.creator_user.user_name
    );

    expect(logsService.logAction).toHaveBeenCalledWith(
      user,
      'Reject',
      'Complaint',
        1,
      `Complaint Rejected by the complaint groups rule .`
    );
    expect(result.status).toBe(200);
    expect(result.body.message).toContain('Rejected');

  })
});
