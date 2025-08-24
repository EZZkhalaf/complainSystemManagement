import { Test, TestingModule } from '@nestjs/testing';
import { LeavesService } from './leaves.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { LeavesEntity, LeaveType } from './entities/leaves.entity';
import { AddLeaveDto } from './dtos/add-leave.dto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { GroupEntity } from '../groups/entities/group.entity';
import { ILike } from 'typeorm';

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
        {provide : getRepositoryToken(GroupEntity) , useValue : {}}

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
        {provide : getRepositoryToken(GroupEntity) , useValue : {}}

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

describe('LeavesService - change leave status', () => {
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
        {provide : getRepositoryToken(GroupEntity) , useValue : {}}

      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw bad request when the ids are not valid number string ', async () => {
    const dto = { new_state :"accept" , leave_handler_id : "aa"}
    const leave_id = "1" ;

    await expect(service.changeLeaveState(leave_id , dto)).rejects.toThrow(
      new BadRequestException("invalid id format")
    )

    await expect(service.changeLeaveState("aa" , dto)).rejects.toThrow(
      new BadRequestException("invalid id format")
    )
  });
  it('should throw not found exception when the leave is not found ', async () => {
    const dto = { new_state :"accept" , leave_handler_id : "1"}
    const leave_id = "1" ;

    leavesRepo.findOne.mockResolvedValue(null)

    await expect(service.changeLeaveState(leave_id , dto)).rejects.toThrow(
      new NotFoundException("leave not found ") 
    )

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
          where : {leave_id : Number(leave_id)},
          relations  :['leave_user'],
          select : {
              leave_description : true ,
              leave_id : true ,
              leave_type : true ,
              leave_status : true ,
              leave_user : {
                  user_id : true ,
                  user_password:false ,
                  user_name : true
              }
          }
      }
    )
  });
  it('should throw not found exception when the user is not found ', async () => {
    const dto = { new_state :"accept" , leave_handler_id : "1"}
    const leave_id = "1" ;
    const fakeLeave = {
      leave_description : "sick leave" ,
      leave_id : 1 ,
      leave_type : "general" ,
      leave_status : "pending" ,
      leave_user : {
          user_id : 1 ,
          
          user_name : "ezz"
      }
    }
    leavesRepo.findOne.mockResolvedValue(fakeLeave)
    userRepo.findOne.mockResolvedValue(null)

    await expect(service.changeLeaveState(leave_id , dto)).rejects.toThrow(
      new NotFoundException("user not found")
    )

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
          where : {leave_id : Number(leave_id)},
          relations  :['leave_user'],
          select : {
              leave_description : true ,
              leave_id : true ,
              leave_type : true ,
              leave_status : true ,
              leave_user : {
                  user_id : true ,
                  user_password:false ,
                  user_name : true
              }
          }
      }
    )

    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(dto.leave_handler_id)} , 
                select :{
                    user_id : true ,
                    user_password:false ,
                    user_name : true
                }
      }
    )
  });
  it('should throw bad request when the new state is not valid for the leave  ', async () => {
    const dto = { new_state :"wrong" , leave_handler_id : "2"}
    const leave_id = "1" ;
    const fakeLeave = {
      leave_description : "sick leave" ,
      leave_id : 1 ,
      leave_type : "general" ,
      leave_status : "pending" ,
      leave_user : {
          user_id : 1 ,
          user_name : "ezz"
      }
    }
    const fakeUser = {
        user_id : 2 ,
        user_name : "ezz"
    }
    leavesRepo.findOne.mockResolvedValue(fakeLeave)
    userRepo.findOne.mockResolvedValue(fakeUser)


    await expect(service.changeLeaveState(leave_id , dto)).rejects.toThrow(
      new BadRequestException('Invalid leave status')
    )

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
          where : {leave_id : Number(leave_id)},
          relations  :['leave_user'],
          select : {
              leave_description : true ,
              leave_id : true ,
              leave_type : true ,
              leave_status : true ,
              leave_user : {
                  user_id : true ,
                  user_password:false ,
                  user_name : true
              }
          }
      }
    )

    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(dto.leave_handler_id)} , 
                select :{
                    user_id : true ,
                    user_password:false ,
                    user_name : true
                }
      }
    )
  });
  it('should change the state of the leave and add the leave handler user to the leave columns in the db', async () => {
    const dto = { new_state :"accepted" , leave_handler_id : "2"}
    const leave_id = "1" ;
    const fakeLeave = {
      leave_description : "sick leave" ,
      leave_id : 1 ,
      leave_type : "general" ,
      leave_status : "pending" ,
      leave_user : {
          user_id : 1 ,
          user_name : "ezz"
      },
      leave_handler : null
    }
    const fakeUser = {
        user_id : 2 ,
        user_name : "ezz"
    }
    const updatedLeave = {
      ...fakeLeave,
      leave_status: dto.new_state,
      leave_handler: fakeUser
    };
    leavesRepo.findOne.mockResolvedValue(fakeLeave)
    userRepo.findOne.mockResolvedValue(fakeUser)


    const result = await service.changeLeaveState(leave_id , dto);
    expect(result.success).toBe(true);
    expect(result.message).toEqual("leave state updated successfully")
    expect(result.leave).toMatchObject(updatedLeave)

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
          where : {leave_id : Number(leave_id)},
          relations  :['leave_user'],
          select : {
              leave_description : true ,
              leave_id : true ,
              leave_type : true ,
              leave_status : true ,
              leave_user : {
                  user_id : true ,
                  user_password:false ,
                  user_name : true
              }
          }
      }
    )

    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(dto.leave_handler_id)} , 
                select :{
                    user_id : true ,
                    user_password:false ,
                    user_name : true
                }
      }
    )
  });

});
describe('LeavesService - get leave info ', () => {
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
        {provide : getRepositoryToken(GroupEntity) , useValue : {}}

      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw bad request when the id are not valid number string ', async () => {
    const leave_id = "asda11";

    await expect(service.getLeave(leave_id)).rejects.toThrow(
      new BadRequestException("leave is is invalid")
    )
  });
  it('should throw not found exception when leave not found', async () => {
    const leave_id = "1";

    leavesRepo.findOne.mockResolvedValue(null);

    await expect(service.getLeave(leave_id)).rejects.toThrow(
      new NotFoundException("leave not found")
    )

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
          where : {leave_id : Number(leave_id)},
          relations : ["leave_user" , 'leave_handler'],
          select : {
              leave_description : true,
              leave_handler : {
                  user_email : true ,
                  user_name : true ,
                  user_password : false ,
                  user_id : true
              },
              leave_user : {
                  user_id : true ,
                  user_name : true , 
                  user_email : true , 
                  user_password : false
              },
              leave_type : true ,
              leave_status : true
          }
      }
    )
  });
  it('should return all the leave info ', async () => {
    const leave_id = "1";
    const fakeLeave = {
        leave_description : "testing",
        leave_handler : {
            user_email : "ezz@gmail.com" ,
            user_name : "ezz" ,
            user_id : 1
        },
        leave_user : {
            user_id : 2 ,
            user_name : "ezz2" , 
            user_email : 'ezz2@gmail.com' 
        },
        leave_type : "general" ,
        leave_status : 'pending'
    }
    leavesRepo.findOne.mockResolvedValue(fakeLeave);

    const result = await service.getLeave(leave_id)

    expect(result.success).toBe(true);
    expect(result.leave).toMatchObject(fakeLeave)

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
          where : {leave_id : Number(leave_id)},
          relations : ["leave_user" , 'leave_handler'],
          select : {
              leave_description : true,
              leave_handler : {
                  user_email : true ,
                  user_name : true ,
                  user_password : false ,
                  user_id : true
              },
              leave_user : {
                  user_id : true ,
                  user_name : true , 
                  user_email : true , 
                  user_password : false
              },
              leave_type : true ,
              leave_status : true
          }
      }
    )
  });
});
describe('LeavesService - delete leave ', () => {
  let service: LeavesService;
  let userRepo : {
    findOne : jest.Mock
  }
  let leavesRepo : {
    findOne : jest.Mock,
    create : jest.Mock ,
    save : jest.Mock,
    delete:jest.Mock
  }
  let groupRepo : {
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
      save : jest.fn() , 
      delete  :jest.fn()
    }
    groupRepo = {
      findOne : jest.fn(),
      create : jest.fn() ,
      save : jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        {provide : getRepositoryToken(UserEntity) , useValue:userRepo},
        {provide : getRepositoryToken(LeavesEntity) , useValue:leavesRepo},
        {provide : getRepositoryToken(GroupEntity) , useValue : groupRepo}
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw bad request when the id are not valid number string ', async () => {
    const leave_id = "1";
    const user_id = "1"

    await expect(service.deleteLeave(leave_id , "aa")).rejects.toThrow(
      new BadRequestException("invalid ids format")
    )

    await expect(service.deleteLeave("ff" , user_id)).rejects.toThrow(
      new BadRequestException("invalid ids format")
    )
  });
  it('should throw not found error when the leave is not found ', async () => {
    const leave_id = "1";
    const user_id = "1"

    leavesRepo.findOne.mockResolvedValue(null)
    await expect(service.deleteLeave(leave_id , user_id)).rejects.toThrow(
      new NotFoundException("leave not found")
    )

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
        where : {leave_id  : Number(leave_id)},
        relations:["leave_user"],
        select : {
            leave_description: true ,
            leave_id : true ,
            leave_user : {
                user_id : true,
                user_password : false
            }
        }
      }
    )
  });
  it('should throw not found error when the user doesnt exists', async () => {
    const leave_id = "1";
    const user_id = "1"

    const fakeLeave = {
      leave_description: "tresing" ,
      leave_id : 1 ,
      leave_user : {
          user_id : 1,
      }
    }
    leavesRepo.findOne.mockResolvedValue(fakeLeave)
    userRepo.findOne.mockResolvedValue(null)
    await expect(service.deleteLeave(leave_id , user_id)).rejects.toThrow(
      new NotFoundException("user not found")
    )

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
        where : {leave_id  : Number(leave_id)},
        relations:["leave_user"],
        select : {
            leave_description: true ,
            leave_id : true ,
            leave_user : {
                user_id : true,
                user_password : false
            }
        }
      }
    )
    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(user_id)}
      }
    )
  });
  it('should delete the leave if the user was the user who requested the leave ', async () => {
    const leave_id = "1";
    const user_id = "1"

    const fakeUser = {
      user_id : 1
    }
    const fakeLeave = {
      leave_description: "tresing" ,
      leave_id : 1 ,
      leave_user : fakeUser
    }
    leavesRepo.findOne.mockResolvedValue(fakeLeave)
    userRepo.findOne.mockResolvedValue(fakeUser)
    leavesRepo.delete.mockResolvedValue({ affected: 1, raw: [] })

    const result = await service.deleteLeave(leave_id,user_id)
    expect(result.success).toBe(true);
    expect(result.message).toEqual("the leave has been deleted successfully by its own user")

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
        where : {leave_id  : Number(leave_id)},
        relations:["leave_user"],
        select : {
            leave_description: true ,
            leave_id : true ,
            leave_user : {
                user_id : true,
                user_password : false
            }
        }
      }
    )
    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(user_id)}
      }
    )
    expect(leavesRepo.delete).toHaveBeenCalled()
  });
  it('should throw not found error when the hr department not found to handle the deletion process', async () => {
    const leave_id = "1";
    const user_id = "1"

    const fakeUser = {
      user_id : 1
    }
    const fakeLeave = {
      leave_description: "tresing" ,
      leave_id : 1 ,
      leave_user : {
        user_id : 2
      }
    }
    leavesRepo.findOne.mockResolvedValue(fakeLeave)
    userRepo.findOne.mockResolvedValue(fakeUser)
    groupRepo.findOne.mockResolvedValue(null)

    await expect(service.deleteLeave(leave_id , user_id)).rejects.toThrow(
      new NotFoundException("not hr group found to delete the request")
    )
    

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
        where : {leave_id  : Number(leave_id)},
        relations:["leave_user"],
        select : {
            leave_description: true ,
            leave_id : true ,
            leave_user : {
                user_id : true,
                user_password : false
            }
        }
      }
    )
    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(user_id)}
      }
    )
    expect(groupRepo.findOne).toHaveBeenCalledWith(
      {
        where : {group_name : ILike("hr")},
        relations : ["users"],
        select : {
            group_id : true ,
            group_name : true ,
            users : {
                user_id : true ,
                user_password : false
            }
        }
      }
    )
  });
  it('should throw forbidden exception  error when the user is neither the leave owner or in the hr group to delete the leave ', async () => {
    const leave_id = "1";
    const user_id = "1"

    const fakeUser = {
      user_id : 1
    }
    const fakeLeave = {
      leave_description: "tresing" ,
      leave_id : 1 ,
      leave_user : {
        user_id : 2
      }
    }
    const fakeGroup = {
      group_id : 1 ,
      group_name : "hr" ,
      users :[ 
        {
          user_id : 6
        }
    ]
    }
    leavesRepo.findOne.mockResolvedValue(fakeLeave)
    userRepo.findOne.mockResolvedValue(fakeUser)
    groupRepo.findOne.mockResolvedValue(fakeGroup)

    await expect(service.deleteLeave(leave_id , user_id)).rejects.toThrow(
      new ForbiddenException("the user must be the owner or in the HR group to delete the leave")
    )
    

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
        where : {leave_id  : Number(leave_id)},
        relations:["leave_user"],
        select : {
            leave_description: true ,
            leave_id : true ,
            leave_user : {
                user_id : true,
                user_password : false
            }
        }
      }
    )
    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(user_id)}
      }
    )
    expect(groupRepo.findOne).toHaveBeenCalledWith(
      {
        where : {group_name : ILike("hr")},
        relations : ["users"],
        select : {
            group_id : true ,
            group_name : true ,
            users : {
                user_id : true ,
                user_password : false
            }
        }
      }
    )
  });
  it('should delete the leave when matches all the cases and the user is in the hr group ', async () => {
    const leave_id = "1";
    const user_id = "5"

    const fakeUser = {
      user_id : 5
    }
    const fakeLeave = {
      leave_description: "tresing" ,
      leave_id : 1 ,
      leave_user : {
        user_id : 2
      }
    }
    const fakeGroup = {
      group_id : 1 ,
      group_name : "hr" ,
      users :[ 
        {
          user_id : 5
        }
    ]
    }
    leavesRepo.findOne.mockResolvedValue(fakeLeave)
    userRepo.findOne.mockResolvedValue(fakeUser)
    groupRepo.findOne.mockResolvedValue(fakeGroup)
    leavesRepo.delete.mockResolvedValue({ affected : 1 , raw  :[]})

    
    const result =  await service.deleteLeave(leave_id , user_id)
    expect(result.success).toBe(true);
    expect(result.message).toEqual("the leave has been deleted successfully by HR group")
    

    expect(leavesRepo.findOne).toHaveBeenCalledWith(
      {
        where : {leave_id  : Number(leave_id)},
        relations:["leave_user"],
        select : {
            leave_description: true ,
            leave_id : true ,
            leave_user : {
                user_id : true,
                user_password : false
            }
        }
      }
    )
    expect(userRepo.findOne).toHaveBeenCalledWith(
      {
        where : {user_id : Number(user_id)}
      }
    )
    expect(groupRepo.findOne).toHaveBeenCalledWith(
      {
        where : {group_name : ILike("hr")},
        relations : ["users"],
        select : {
            group_id : true ,
            group_name : true ,
            users : {
                user_id : true ,
                user_password : false
            }
        }
      }
    )
    expect(leavesRepo.delete).toHaveBeenCalledWith(fakeLeave.leave_id)
  });

});
