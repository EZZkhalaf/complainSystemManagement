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
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as EmailUtils from '../utils/send-complaints-email.util';

describe('UserService', () => {
  let service : UserService;

  let userRepo :{
    findOne : jest.Mock ,
    count : jest.Mock
  }
  let  groupRepo : {
    findOne : jest.Mock,
    save : jest.Mock , 
    count : jest.Mock
  }
  let complaintRepo : {
    create : jest.Mock ,
    findOne : jest.Mock ,
    delete : jest.Mock , 
    save : jest.Mock,
    find : jest.Mock , 
    count : jest.Mock
  }
  let rolesRepo : {
    create : jest.Mock ,
    findOne : jest.Mock ,
    delete : jest.Mock , 
    save : jest.Mock,
    find : jest.Mock , 
    count : jest.Mock
  }
  let complaintgroupsRuleRepo : {
    findOne : jest.Mock ,

  }
  let logsService : {
    logAction : jest.Mock
  }
  beforeEach(async () => {
    userRepo = {
      findOne : jest.fn(),
      count : jest.fn() 
    }
    groupRepo = {
      findOne : jest.fn(),
      save : jest.fn(),
      count  :jest.fn()
    }
    complaintRepo = {
      create : jest.fn(),
      findOne : jest.fn() ,
      find : jest.fn(),
      delete : jest.fn() ,
      save : jest.fn(),
      count : jest.fn()
    }
    rolesRepo = {
      create : jest.fn(),
      findOne : jest.fn() ,
      find : jest.fn(),
      delete : jest.fn() ,
      save : jest.fn(),
      count : jest.fn()
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
        UserService,
        {provide : getRepositoryToken(UserEntity) , useValue :userRepo},
        {provide : getRepositoryToken(ComplaintEntity) , useValue :complaintRepo},
        {provide : getRepositoryToken(RolesEntity) , useValue :rolesRepo},
        {provide : getRepositoryToken(ComplaintGroupsRuleEntity) , useValue :complaintgroupsRuleRepo},
        {provide : getRepositoryToken(GroupEntity) , useValue :groupRepo},
        {provide : LogsService , useValue : logsService}
      ],
    }).compile();

    service = module.get<UserService>(UserService)
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //chnage user role 
  it("should throw not found error when the user not found" , async()=>{
    const dto : any = {userId : "1" , newRole : "user"}

    userRepo.findOne.mockResolvedValue(null);

    await expect(service.changeUserRole(dto)).rejects.toThrow(
      new NotFoundException('User not found')
    )
    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(dto.userId)}
      }
    )
  })
  it("should throw not found error when the new role is not found ", async() =>{
    const dto : any = {userId : "1" , newRole : "user"}
    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz" ,
      user_email : "ezz@gmail.com"
    }

    const fakeRoles = [
      {
        role_id : 1 , 
        role_name : "first",
        users : []
      },
      {
        role_id : 2 , 
        role_name : "second",
        users : []
      },
      {
        role_id : 3 , 
        role_name : "third",
        users : []
      }
    ]
    userRepo.findOne.mockResolvedValue(fakeUser);
    rolesRepo.find.mockResolvedValue(fakeRoles)
    rolesRepo.findOne.mockResolvedValue(null)
    await expect(service.changeUserRole(dto)).rejects.toThrow(
      new NotFoundException('Role not found')
    )
    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(dto.userId)}
      }
    )

    expect(rolesRepo.find).toHaveBeenCalledWith(
      {
        relations: ["users"],
        where: {
            users: { user_id: Number(dto.userId) }
        }
      }
    )
    expect(rolesRepo.findOne).toHaveBeenCalledWith(
      {
        where : {role_name : dto.newRole},
        relations : ['users']
      }
    )
  })
  it("should change the user role and save it and then add log for it ", async() =>{
    const dto : any = {userId : "1" , newRole : "user"}
    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz" ,
      user_email : "ezz@gmail.com"
    }

    const fakeRoles = [
      {
        role_id : 1 , 
        role_name : "first",
        users : []
      },
      {
        role_id : 2 , 
        role_name : "second",
        users : []
      },
      {
        role_id : 3 , 
        role_name : "third",
        users : []
      }
    ]

    const newRole = {
      role_id : 5 ,
      role_name : "newRole" ,
      users : []
    }
    const updateRole = {
      ...newRole ,
      users : [fakeUser]
    }
    userRepo.findOne.mockResolvedValue(fakeUser);
    rolesRepo.find.mockResolvedValue(fakeRoles)
    rolesRepo.findOne.mockResolvedValue(newRole)
    rolesRepo.save.mockResolvedValue(updateRole)


    const result = await service.changeUserRole(dto)

    expect(result.success).toBe(true);
    expect(result.message).toEqual('User role updated successfully')
    expect(result.role).toEqual(updateRole)

    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(dto.userId)}
      }
    )

    expect(rolesRepo.find).toHaveBeenCalledWith(
      {
        relations: ["users"],
        where: {
            users: { user_id: Number(dto.userId) }
        }
      }
    )
    expect(rolesRepo.findOne).toHaveBeenCalledWith(
      {
        where : {role_name : dto.newRole},
        relations : ['users']
      }
    )

    expect(rolesRepo.save).toHaveBeenCalledWith(updateRole)

    expect(logsService.logAction).toHaveBeenCalledWith(
      fakeUser,
      'Role',
      'User',
      fakeUser.user_id,
      `Changed The User Role to ${newRole.role_name}`,
    )
  })

  //fetch users form the db
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


  //fetch users role edition 
  it('should return users mapped with their roles', async () => {
    const fakeRoles = [
      {
        role_id: 1,
        role_name: 'HR',
        users: [
          { user_id: 1, user_name: 'Ezz', user_email: 'ezz@test.com', profilePicture: 'pic1' },
          { user_id: 2, user_name: 'Omar', user_email: 'omar@test.com', profilePicture: 'pic2' },
        ],
        permissions: [],
      },
      {
        role_id: 2,
        role_name: 'moderator',
        users: [
          { user_id: 3, user_name: 'Sara', user_email: 'sara@test.com', profilePicture: 'pic3' },
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


  //add user to group
  it("should throw not found error when group not found" , async() =>{
    const dto ={ userId : "1" , groupId : "1"}

    groupRepo.findOne.mockResolvedValue(null);
    
    await expect(service.addUserToGroup(dto)).rejects.toThrow(
      new NotFoundException("group not found")
    )

    expect(groupRepo.findOne).toHaveBeenCalledWith(
      {
        where :{group_id : Number(dto.groupId)},
                relations: ['users'],
                select: {
                    users: {
                        user_id: true,
                        user_name: true,
                        user_email: true,
                        profilePicture: true,
                        user_password : false
                    },
                },
      }
    )
  })
  it("should throw not found error when user not found" , async() =>{
    const dto ={ userId : "1" , groupId : "1"}
    const fakeGroup = {
      group_id : 1, 
      group_name : "HR",
      users : []
    }
    groupRepo.findOne.mockResolvedValue(fakeGroup);
    userRepo.findOne.mockResolvedValue(null)


    await expect(service.addUserToGroup(dto)).rejects.toThrow(
      new NotFoundException("user not found")
    )

    expect(groupRepo.findOne).toHaveBeenCalledWith(
      {
        where :{group_id : Number(dto.groupId)},
                relations: ['users'],
                select: {
                    users: {
                        user_id: true,
                        user_name: true,
                        user_email: true,
                        profilePicture: true,
                        user_password : false
                    },
                },
      }
    )

    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(dto.userId)}
      }
    )
  })
  it("user already in the group" , async() =>{
    const dto ={ userId : "1" , groupId : "1"}

    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz",
      user_email : "ezz@gmail.com"
    }
    const fakeGroup = {
      gorup_id : 1, 
      group_name : "HR",
      users : [fakeUser]
    }
    groupRepo.findOne.mockResolvedValue(fakeGroup);
    userRepo.findOne.mockResolvedValue(fakeUser)
    

    await expect(service.addUserToGroup(dto)).rejects.toThrow(
      new BadRequestException("user already in the group")
    )

    expect(groupRepo.findOne).toHaveBeenCalledWith(
      {
        where :{group_id : Number(dto.groupId)},
                relations: ['users'],
                select: {
                    users: {
                        user_id: true,
                        user_name: true,
                        user_email: true,
                        profilePicture: true,
                        user_password : false
                    },
                },
      }
    )

    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(dto.userId)}
      }
    )
  })
  it("add user to the group and save and addd log then return success" , async() =>{
    const dto ={ userId : "1" , groupId : "1"}

    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz",
      user_email : "ezz@gmail.com"
    }
    const fakeGroup = {
      group_id : 1, 
      group_name : "HR",
      users : []
    }

    const updatedGroup = {
      ...fakeGroup ,
      users : [fakeUser]
    }
    groupRepo.findOne.mockResolvedValue(fakeGroup);
    userRepo.findOne.mockResolvedValue(fakeUser)
    groupRepo.save.mockResolvedValue(updatedGroup)

    const result = await service.addUserToGroup(dto)
    expect(result.success).toBe(true);
    expect(result.message).toEqual('User added to group successfully')
    expect(result.group).toEqual(updatedGroup)

    expect(groupRepo.findOne).toHaveBeenCalledWith(
      {
        where :{group_id : Number(dto.groupId)},
                relations: ['users'],
                select: {
                    users: {
                        user_id: true,
                        user_name: true,
                        user_email: true,
                        profilePicture: true,
                        user_password : false
                    },
                },
      }
    )

    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(dto.userId)}
      }
    )
    expect(groupRepo.save).toHaveBeenCalledWith(updatedGroup)

    expect(logsService.logAction).toHaveBeenCalledWith(
      fakeUser , 
      "Add-User" , 
      "Group" , 
      fakeGroup.group_id , 
      `Has Been Added to Group ${fakeGroup.group_name}`
    )
  })


  //get summary 
    it('should return system summary with counts', async () => {
    const userId = "1";

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


  //edit user info 
  it("should throw not found error when the user not found" , async() =>{
    const id ="1"
    const body : any = {}
    const file: Express.Multer.File = {
      fieldname: "file",
      originalname: "test.txt",
      encoding: "7bit",
      mimetype: "text/plain",
      size: 0,
      filename: "test.txt",
    };
    const currentUser = {}
    userRepo.findOne.mockResolvedValue(null)
    
    await expect(service.editUserInfo(id, body , file , currentUser)).rejects.toThrow(
      new NotFoundException('User not found')
    )

    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(id)},
        select : {
            user_email : true ,
            user_name : true ,
            user_password : true ,
            user_id : true ,
            user_role : {
                role_id : true ,
                role_name : true ,
                users : false,
                permissions : false
            }
        }
      }
    )
  })
  it("should throw bad request error when the password is incorrect" , async() =>{
    const id ="1"
    const body : any = {newName : "ezz", newEmail :"ezz@gmail.com", oldPassword : "654321", newPassword : "654321"}
    const file: Express.Multer.File = {
      fieldname: "file",
      originalname: "test.txt",
      encoding: "7bit",
      mimetype: "text/plain",
      size: 0,
      filename: "test.txt",
    };
    const currentUser = {}
    const oldPassword = "123456"
    const hashedPassword = await bcrypt.hash(oldPassword , 10)
    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz",
      user_email : "ezz@gmail.com",
      user_password : hashedPassword ,
      user_role : {
        role_id : 1,
        role_name : "admin"
      }
    }
    userRepo.findOne.mockResolvedValue(fakeUser)
    
    await expect(service.editUserInfo(id, body , file , currentUser)).rejects.toThrow(
      new UnauthorizedException("old password is incorrect")
    )

    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(id)},
        select : {
            user_email : true ,
            user_name : true ,
            user_password : true ,
            user_id : true ,
            user_role : {
                role_id : true ,
                role_name : true ,
                users : false,
                permissions : false
            }
        }
      }
    )
  })
  it("when the email changes and the new email allready taken by anotherr user in the system ,throw new error " , async() =>{
    const id ="1"
    const body : any = {newName : "ezz", newEmail :"ezz2@gmail.com", oldPassword : "654321", newPassword : "654321"}
    const file: Express.Multer.File = {
      fieldname: "file",
      originalname: "test.txt",
      encoding: "7bit",
      mimetype: "text/plain",
      size: 0,
      filename: "test.txt",
    };
    const currentUser = {}
    const oldPassword = "654321"
    const hashedPassword = await bcrypt.hash(oldPassword , 10)
    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz",
      user_email : "ezz@gmail.com",
      user_password : hashedPassword ,
      user_role : {
        role_id : 1,
        role_name : "admin"
      }
    }
    const existinUser ={
      user_id : 2 ,
      user_name : "ezz",
      user_email : "ezz@gmail.com",
      user_password : hashedPassword ,
      user_role : {
        role_id : 1,
        role_name : "admin"
      }
    }
    userRepo.findOne.mockResolvedValue(fakeUser)
    userRepo.findOne.mockResolvedValue(existinUser)
    await expect(service.editUserInfo(id, body , file , currentUser)).rejects.toThrow(
      new BadRequestException('Email already taken')
    )

    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(id)},
        select : {
            user_email : true ,
            user_name : true ,
            user_password : true ,
            user_id : true ,
            user_role : {
                role_id : true ,
                role_name : true ,
                users : false,
                permissions : false
            }
        }
      }
    )

    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
         where : { user_email: body.newEmail }
      }
    )
  })
  it("when the email changes and the new email is available , generate token with the new data and add it to the token and send it as a link " , async() =>{
    const id ="1"
    const body : any = {newName : "ezz", newEmail :"ezz@gmail.com", oldPassword : "654321", newPassword : "654321"}
    const file: Express.Multer.File = {
      fieldname: "file",
      originalname: "test.txt",
      encoding: "7bit",
      mimetype: "text/plain",
      size: 0,
      filename: "test.txt",
    };
    const currentUser = {}
    const oldPassword = "654321"
    const hashedPassword = await bcrypt.hash(oldPassword , 10)
    const fakeUser = {
      user_id : 1 ,
      user_name : "ezz",
      user_email : "ezz@gmail.com",
      user_password : hashedPassword ,
      user_role : {
        role_id : 1,
        role_name : "admin"
      }
    }
    
    userRepo.findOne.mockResolvedValueOnce(fakeUser)
    userRepo.findOne.mockResolvedValueOnce(null)
    
    
    const result = await service.editUserInfo(id, body , file , currentUser)
    expect(result.success).toBe(true);
    expect(result.message).toEqual('Verification link sent to new email')

    expect(userRepo.findOne).toHaveBeenNthCalledWith(1 ,
      {
        where : {user_id : Number(id)},
        select : {
            user_email : true ,
            user_name : true ,
            user_password : true ,
            user_id : true ,
            user_role : {
                role_id : true ,
                role_name : true ,
                users : false,
                permissions : false
            }
        }
      }
    )

    expect(userRepo.findOne).toHaveNthReturnedWith(2 ,
      {
         where : { user_email: body.newEmail }
      }
    )
  })
});
