import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { LogsService } from '../logs/logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { GroupEntity } from './entities/group.entity';
import { RolesEntity } from '../roles/entities/roles.entity';
import { OTPEntity } from '../auth/entities/OTP.entity';
import { TempSessionEntity } from '../auth/entities/tempSession.entity';
import { ComplaintEntity } from '../complaint/entities/complaint.entity';
import { ComplaintGroupsRuleEntity } from '../complaint/entities/complaint-groups-rule.entity';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { group } from 'console';
import { GroupOutputDto } from './dtos/group-output.dto';
import { plainToInstance } from 'class-transformer';

describe('GroupsService', () => {
  let service: GroupsService;
  let logsService : {
    logAction : jest.Mock
  }

  let groupsRepo : {
    findOne : jest.Mock ,
    find : jest.Mock,
    create:jest.Mock ,
    delete : jest.Mock ,
    save : jest.Mock , 
    remove : jest.Mock,
    createQueryBuilder:jest.Mock
  }

  let usersRepo : {
    findOne : jest.Mock ,
    create:jest.Mock ,
    delete : jest.Mock ,
    save : jest.Mock
  }

  let  complaintsRepo : {
    createQueryBuilder : jest.Mock
  }
  beforeEach(async () => {
    logsService = {
      logAction : jest.fn()
    }
    groupsRepo = {
      findOne : jest.fn() ,
      find : jest.fn(),
      create : jest.fn() ,
      save : jest.fn() ,
      delete: jest.fn() , 
      remove : jest.fn() , 
      createQueryBuilder : jest.fn()
    }
    usersRepo = {
      findOne : jest.fn() ,
      create : jest.fn() ,
      save : jest.fn() ,
      delete: jest.fn()
    }
    complaintsRepo = {
      createQueryBuilder : jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: LogsService, useValue: logsService },
        { provide: getRepositoryToken(UserEntity), useValue: usersRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: groupsRepo },
        { provide: getRepositoryToken(RolesEntity), useValue: {} },
        { provide: getRepositoryToken(OTPEntity), useValue: {} },
        { provide: getRepositoryToken(TempSessionEntity), useValue: {} },
        { provide: getRepositoryToken(ComplaintEntity), useValue: complaintsRepo },
        { provide: getRepositoryToken(ComplaintGroupsRuleEntity), useValue: {} },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //create group
  it("should throw an error when the group name already exists " , async() =>{
    const dto : any = {name : "123" , description : "123123"}
    const fakeGroup = {
      group_name : "123"
    }
    groupsRepo.findOne.mockResolvedValue(fakeGroup);

    await expect(service.createGroup("123" , dto)).rejects.toThrow(
      new BadRequestException('Group name already exists')
    )

    expect(groupsRepo.findOne).toHaveBeenCalledWith(
      {
        where: { group_name: dto.name }
      }
    )
  })
  it("should throw not found error when it cant find the user by the id" , async() =>{
    const dto : any = {name : "123" , description : "123123"}
    const userId = "1"
    groupsRepo.findOne.mockResolvedValue(null);
    usersRepo.findOne.mockResolvedValue(null);

    await expect(service.createGroup(userId , dto)).rejects.toThrow(
      new  NotFoundException('User not found')
    )

    expect(groupsRepo.findOne).toHaveBeenCalledWith(
       {
        where: { group_name: dto.name }
      }
    )
    expect(usersRepo.findOne).toHaveBeenCalledWith({
      where: { user_id: Number(userId) },
    });
  })
  it("successfully create group and add log and return success" , async() => {
    const dto : any = {name : "123" , description : "123123"}
    const userId = "1"
    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz" ,
      useR_email : "ezz@gmail.com"
    }

    const fakeGroup = {
      group_id : 1,
      group_name : "123"
    }

    groupsRepo.findOne.mockResolvedValue(null) 
    usersRepo.findOne.mockResolvedValue(fakeUser)
    groupsRepo.create.mockReturnValue(fakeGroup)
    groupsRepo.save.mockResolvedValue(true)
    logsService.logAction(
      fakeUser.user_id ,
      'Create-Group',
      'Group',
      fakeGroup.group_id,
      `Created the Group called : (${fakeGroup.group_name})`
    )

    const result = await service.createGroup(userId , dto)
     expect(result.success).toBe(true)
     expect(result.message).toEqual('Group created successfully')
     expect(result.group).toEqual(fakeGroup)

    expect(groupsRepo.findOne).toHaveBeenCalledWith({
      where: { group_name: dto.name }
    })
    expect(usersRepo.findOne).toHaveBeenCalledWith({
      where : {user_id : Number(userId)}
    })
    expect(groupsRepo.create).toHaveBeenCalledWith(
      {
          group_name: dto.name,
          users: [fakeUser] 
      }
    )


  })

  //remove user from group 
  it("should throw not found error when group not found" , async() =>{
    const dto : any = {groupId : "1" , userId: "1"}
    groupsRepo.findOne.mockResolvedValue(null);

    await expect(service.removeUserFomeGroup(dto)).rejects.toThrow(
      new NotFoundException('Group not found')
    )
    expect(groupsRepo.findOne).toHaveBeenCalledWith(
      {
            where : {group_id : dto.groupId},
            relations:['users']
        }
    )

  })
  it("should throw not found error when the user not found in the db" , async() =>{
    const dto : any = {groupId : "1" , userId: "1"}
    const fakeGroup = {
      group_id : 1 ,
      gorup_name : "GroupName"
    }

    groupsRepo.findOne.mockResolvedValue(fakeGroup);
    usersRepo.findOne.mockResolvedValue(null);

    await expect(service.removeUserFomeGroup(dto)).rejects.toThrow(
      new NotFoundException("user not found")
    )

    expect(groupsRepo.findOne).toHaveBeenCalledWith(
      {
            where : {group_id : dto.groupId},
            relations:['users']
        }
    )
    expect(usersRepo.findOne).toHaveBeenCalledWith(
      {
        where : { user_id : Number(dto.userId)}
      }
    )
  })
  it("should return error when the user is not an employee in the current group" , async() => {
    const dto : any = {groupId : "1" , userId: "1"}
    const fakeGroup = {
      group_id : 1 ,
      group_name : "GroupName" , 
      users : []
    }
    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz" ,
      user_email : "ezz@gmail.com",

    }

    groupsRepo.findOne.mockResolvedValue(fakeGroup);
    usersRepo.findOne.mockResolvedValue(fakeUser);
    

    await expect(service.removeUserFomeGroup(dto)).rejects.toThrow(
      new BadRequestException("user is not in the group  to remove")
    )

    expect(groupsRepo.findOne).toHaveBeenCalledWith(
      {
            where : {group_id : dto.groupId},
            relations:['users']
        }
    )
    expect(usersRepo.findOne).toHaveBeenCalledWith(
      {
        where : { user_id : Number(dto.userId)}
      }
    )
  })
  it("should remove the user form group and add the log and return success" , async()=>{
    const dto : any = {groupId : 1 , userId: 1}
    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz" ,
      user_email : "ezz@gmail.com",

    }
    const fakeGroup = {
      group_id : 1 ,
      group_name : "GroupName" , 
      users : [fakeUser]
    }
    

    groupsRepo.findOne.mockResolvedValue(fakeGroup);
    usersRepo.findOne.mockResolvedValue(fakeUser);
    groupsRepo.save.mockResolvedValue(true)
    logsService.logAction(
      fakeUser , 
      "Remove-User", 
      "Group", 
      fakeGroup.group_id, 
      `Has Been Removed From Group ${fakeGroup.group_name}`
    )
    const result = await service.removeUserFomeGroup(dto)

    expect(result.success).toBe(true);
    expect(result.message).toEqual('User removed from group successfully')
    // expect(result.group).toBe(fakeGroup)
    expect(groupsRepo.findOne).toHaveBeenCalledWith(
      {
            where : {group_id : dto.groupId},
            relations:['users']
        }
    )
    expect(usersRepo.findOne).toHaveBeenCalledWith(
      {
        where : { user_id : Number(dto.userId)}
      }
    )

  })


  //get group info and users too
  it("should throw not found error when te group not found " , async() => {
    const groupId = "1";

    groupsRepo.findOne.mockResolvedValue(null);

    // const result = await service.getGroupInfoAndUsers(groupId)

    await expect(service.getGroupInfoAndUsers(groupId)).rejects.toThrow(
      new NotFoundException("group not found")
    )
  })
  it("should return the group and the users info in it and return success" , async() => {
    const groupId = "1";
    const fakeGroup ={
      group_id : 1 ,
      gorup_name : "group name" , 
      users : [] 
    }
    groupsRepo.findOne.mockResolvedValue(fakeGroup);

    const result = await service.getGroupInfoAndUsers(groupId)
    expect(result.success).toBe(true)
    const expectedResult = plainToInstance(GroupOutputDto , fakeGroup , {excludeExtraneousValues:true}) 
    expect(result.group).toMatchObject(expectedResult)
    expect(groupsRepo.findOne).toHaveBeenCalledWith(
      {
        where : {group_id : Number(groupId)},
        relations : ['users']
      }
    )
  })


  //delete group 
  it("should throw not found error when the group is not found " , async()=>{
    const user : any = {} ;
    const groupId  = '1'
    groupsRepo.findOne.mockResolvedValue(null)

    await expect(service.deleteGroup(user , groupId)).rejects.toThrow(
      new NotFoundException('Group not found')
    )
  })
  it("should delete group and add log and return success" , async() => {
    const user : any = {user_id : 1} ;
    const groupId  = '1'
    const fakeGroup = {
      group_id : 1 ,
      group_name  : "name",
      complaintGroupsRules:[],
      users:[]
    }
    groupsRepo.findOne.mockResolvedValue(fakeGroup)
    groupsRepo.remove.mockResolvedValue(true);
    logsService.logAction(
      user,
       "Delete-Group", 
       "Group", 
       fakeGroup.group_id, 
       `Has Deleted The Group ${fakeGroup.group_name}`
    )
    const result = await service.deleteGroup(user ,groupId)
    expect(result.success).toBe(true);
    expect(result.message).toEqual('Group deleted successfully' )

    expect(groupsRepo.findOne).toHaveBeenCalledWith(
      {
        where: { group_id: Number(groupId) },
        relations: { complaintGroupsRules: true },
      }
    )
  })

  //get user groups
  it("shouldthrow new error when the user not found" , async() =>{
    const userId = "123"
    usersRepo.findOne.mockResolvedValue(null)

    await expect(service.getUserGroups(userId)).rejects.toThrow(
      new NotFoundException("user not found")
    )
    expect(usersRepo.findOne).toHaveBeenCalledWith({
      where : {user_id : Number(userId)}
    })
  })
  it("should return the users groups even if there none " , async() =>{
    const userId = "123" 
    const fakeUser = {
      user_id : 123 ,
      user_name: "ezz" ,
      user_email : "ezz@gmail.com"
    }
    const fakeGroups = [
      {
        group_id: 1 ,
        group_name : "first" ,
        users : []
      },
      {
        group_id: 2 ,
        group_name : "second" ,
        users : []
      }
    ]
    usersRepo.findOne.mockResolvedValue(fakeUser)
    groupsRepo.find.mockResolvedValue(fakeGroups)

    const result = await service.getUserGroups(userId)
    const expectedResult = plainToInstance(GroupOutputDto , fakeGroups , {excludeExtraneousValues : true})

    expect(result.success).toBe(true);
    expect(result.groups).toMatchObject(expectedResult)
    expect(usersRepo.findOne).toHaveBeenCalledWith({
      where : {user_id : Number(userId)}
    })
    expect(groupsRepo.find).toHaveBeenCalledWith(
      {
          where : {users :{user_id :  Number(userId)}},
          relations : ['users']
      }
    )
  })

  //list groups
  it("should list all the groups in the db" , async() =>{
    const fakeGroups = [
      {
        group_id : 1 ,
        group_name : "first" ,
        users:[
          {
            user_id : 1,
            user_name : "ezz",
            user_email : "ezz@gmail.com"
          }
        ]
      },
      {
        group_id : 2 ,
        group_name : "second" ,
        users:[
          {
            user_id : 1,
            user_name : "ezz",
            user_email : "ezz@gmail.com"
          }
        ]
      },
      {
        group_id : 3 ,
        group_name : "third" ,
        users:[
          {
            user_id : 1,
            user_name : "ezz",
            user_email : "ezz@gmail.com"
          }
        ]
      }
    ]

    groupsRepo.find.mockResolvedValue(fakeGroups);

    const result = await service.listGroups("1")
    // const expectedResult = plainToInstance(GroupOutputDto , fakeGroups , {excludeExtraneousValues : true})
    expect(result.success).toBe(true)
    expect(result.groups).toMatchObject(fakeGroups)
    expect(groupsRepo.find).toHaveBeenCalledWith({
      relations : ['users'],
            select : {
                group_id :true,
                group_name :true,
                users:{
                    user_id:true ,
                    user_name: true ,
                    user_email : true,
                    user_password :false ,
                    profilePicture:false
                }

            }
    })
  })


  //list group complaints 
  it("should throw new not found error when the gorup not found" , async() =>{
    const groupId = "1"
    const dto : any = {userId : "1",type : "general",status : "pending",page : 1 ,limit : 10}
    groupsRepo.findOne.mockResolvedValue(null)

    await expect(service.listGroupComplaints(groupId , dto)).rejects.toThrow(
      new NotFoundException("group not found")
    )

    expect(groupsRepo.findOne).toHaveBeenCalledWith({
            where : {group_id : Number(groupId)},
            relations:['users']
    })
  })
  it("shold throw forbidden error when the user is not in the group to list the complaints" , async() =>{
    const groupId = "1"
    const dto : any = {userId : "2",type : "general",status : "pending",page : 1 ,limit : 10}
    const fakeGroup = {
      group_id : 1 ,
      group_name : "name",
      users: ["1"]
    }
    groupsRepo.findOne.mockResolvedValue(fakeGroup)

    await expect(service.listGroupComplaints(groupId , dto)).rejects.toThrow(
      new ForbiddenException('User is not allowed to view other groups complaints')    
    )

    expect(groupsRepo.findOne).toHaveBeenCalledWith({
            where : {group_id : Number(groupId)},
            relations:['users']
    })

  })
  it("should list all the group complaints and return success " , async() => {
    const groupId = "1"
    const dto : any = {userId : "123",type : "general",status : "pending",page : 1 ,limit : 10}
    const fakeUser = { user_id: 123, user_name: "ezz" };
    const fakeGroup = {
      group_id : 1 ,
      group_name : "name",
      users: [fakeUser]
    }
    const fakeComplaints = [
      { complaint_id: 1, complaint_type: "general", complaint_status: "pending" },
      { complaint_id: 2, complaint_type: "technical", complaint_status: "resolved" },
    ];
    const fakeTotal = 5;
    groupsRepo.findOne.mockResolvedValue(fakeGroup)

    const queryBuild : any = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([fakeComplaints, fakeTotal]),
    }

    complaintsRepo.createQueryBuilder.mockReturnValue(queryBuild)

    const result = await service.listGroupComplaints(groupId , dto)

    expect(result.success).toBe(true);
    expect(result.complaints).toEqual(fakeComplaints);
    expect(result.total).toBe(fakeTotal);
    expect(result.page).toBe(1)
    expect(result.totalPages).toBe(Math.ceil(fakeTotal/ dto.limit))
    expect(groupsRepo.findOne).toHaveBeenCalledWith({
            where : {group_id : Number(groupId)},
            relations:['users']
    })
    expect(complaintsRepo.createQueryBuilder).toHaveBeenCalledWith('complaint_info')
    expect(queryBuild.innerJoin).toHaveBeenCalledWith("complaint_info.groupsQueue", "group_entity")
    expect(queryBuild.where).toHaveBeenCalledWith("group_entity.group_id = :groupId", { groupId: Number(groupId)})    
  })

  //search groups 
  it("should return the searched groups to the user ,  even if there is none" , async() => {

    const search = "fi"
    const fakeGroups = [
      {
        group_id : 1 ,
        group_name :"first" ,
        users : []
      }
    ]
    const queryBuild = {
      where : jest.fn().mockReturnThis(),
      getMany : jest.fn().mockResolvedValue(fakeGroups)
    }
    groupsRepo.createQueryBuilder.mockReturnValue(queryBuild)

    const result = await service.searchGroups(search);
    expect(result.success).toBe(true);
    expect(result.groups).toMatchObject(fakeGroups)

    expect(groupsRepo.createQueryBuilder).toHaveBeenCalledWith("group_entity")
    expect(queryBuild.where).toHaveBeenCalledWith('group_entity.group_name ILIKE :search', { search: `%${search}%` })
  })
})
