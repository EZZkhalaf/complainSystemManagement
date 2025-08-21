import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { LogsService } from '../logs/logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RolesEntity } from './entities/roles.entity';
import { PermissionEntity } from './entities/permission.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { In } from 'typeorm';
import { permission } from 'process';
import { AddPermissionsToRoleDto } from './dtos/add-permissions-to-role.dto';

describe('RolesService', () => {
  let service: RolesService;

  
  let rolesRepo : {
    create : jest.Mock ,
    findOne : jest.Mock ,
    delete : jest.Mock , 
    save : jest.Mock,
    find : jest.Mock , 
    count : jest.Mock ,
    createQueryBuilder : jest.Mock
  }
  
  let logsService : {
    logAction : jest.Mock
  }

  let permissionRepo : {
    findOne: jest.Mock,
    find: jest.Mock,
    save: jest.Mock,
    delete: jest.Mock,
    create: jest.Mock,
    count: jest.Mock,
  };
  beforeEach(async () => {
    
    rolesRepo = {
      create : jest.fn(),
      findOne : jest.fn() ,
      find : jest.fn(),
      delete : jest.fn() ,
      save : jest.fn(),
      count : jest.fn(),
      createQueryBuilder : jest.fn()
    }
    
    permissionRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    };

    
    logsService = {
      logAction : jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        
        {provide : getRepositoryToken(PermissionEntity) , useValue : permissionRepo},
        {provide : getRepositoryToken(RolesEntity) , useValue : rolesRepo},
        {provide : LogsService , useValue :logsService},
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //get roles
  it("should return all the roles" , async() =>{
    const fakeRoles = [
      {
        id: 1,
        role_name: 'Admin',
        permissions: [{ id: 1, name: 'CREATE' }],
        users: [{ user_id: 1, user_name: 'Ezz' }],
      },
      {
        id: 2,
        role_name: 'User',
        permissions: [{ id: 2, name: 'READ' }],
        users: [{ user_id: 2, user_name: 'Alice' }],
      },
    ];
    const queryBuilder = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(fakeRoles),
    }

    rolesRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.getRoles();

    expect(result.success).toBe(true);
    expect(result.roles).toEqual(fakeRoles);

    expect(rolesRepo.createQueryBuilder).toHaveBeenCalledWith('role_info');
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('role_info.permissions', 'permission_info');
    expect(queryBuilder.leftJoin).toHaveBeenCalledWith('role_info.users', 'user_info');
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(['user_info.user_name']);
    expect(queryBuilder.getMany).toHaveBeenCalled();
  })

  //add permissions 
  it("should throw new error when the permissions are not in an array " , async() => {
    const user = { user_id: 1 };

    const invalidPermission = [{ description: 'Can do something' }];
    await expect(service.addPermissions(user, invalidPermission))
      .rejects
      .toThrow("Each permission must be an object with 'name' and 'description' as strings");

    const invalidPermission2 = [{name :'not-an-object'}];
    await expect(service.addPermissions(user, invalidPermission2))
      .rejects
      .toThrow("Each permission must be an object with 'name' and 'description' as strings");
  })
  it("should return a message when all the new permission are not added to the db bec they already exists " , async() =>{
    const user = { user_id: 1 };

    const inputPermissions = [
      { name : "name1" ,description: 'Can do something' },
      { name : "name2" ,description: 'Can do something' },
    ];

    const inputPermissions2 = [
      { permission_name : "name1" ,description: 'Can do something' },
      { permission_name : "name2" ,description: 'Can do something' },
    ];

    const uniquePermissions = [
        ...new Map(inputPermissions.map((p) => [p.name, p])).values(),
    ];
    
    

    permissionRepo.find.mockResolvedValue(inputPermissions2)

    const result = await service.addPermissions(user , inputPermissions)
    expect(result.success).toBe(true);
    expect(result.message).toEqual('No new permissions to add (all already exist)')

    expect(permissionRepo.find).toHaveBeenCalledWith({
      where: { permission_name: In(uniquePermissions.map((p) => p.name)) },
      select: ['permission_name'],
    })
  })
  it("should add these unique permissions to the db  " , async() =>{
    const user = { user_id: 1 };

    const inputPermissions = [
      { name : "name11" ,description: 'Can do something' },
      { name : "name22" ,description: 'Can do something' },
    ];

    const inputPermissions2 = [
      { permission_name : "name1" ,description: 'Can do something' },
      { permission_name : "name2" ,description: 'Can do something' },
    ];

    const uniquePermissions = [
        ...new Map(inputPermissions.map((p) => [p.name, p])).values(),
    ];
    
    

    permissionRepo.find.mockResolvedValue(inputPermissions2)
    logsService.logAction(
      user,
      'Add-Permission',
      'Permission',
      user.user_id,
      `Added permissions: [${inputPermissions.map(p => p.name).join(', ')}]`
    )

    const result = await service.addPermissions(user , inputPermissions)
    expect(result.success).toBe(true);
    expect(result.message).toEqual('New permissions added successfully')

    expect(permissionRepo.find).toHaveBeenCalledWith({
      where: { permission_name: In(uniquePermissions.map((p) => p.name)) },
      select: ['permission_name'],
    })
  })

  //delete permission 
  it("should throw not found error when the permission is not found" , async() => {
    const user = {};
    const id = "1"

    permissionRepo.findOne.mockResolvedValue(null)

    await expect(service.deletePermission(user , id)).rejects.toThrow(
      new NotFoundException('Permission not found')
    )

    expect(permissionRepo.findOne).toHaveBeenCalledWith({
      where : { permission_id : Number(id)}
    })
  })
  it("should find the permission delete it and remove it from the roles and add llog and return success" , async() => {
    const user = {user_id : 1};
    const id = "1"

    const fakePermission = {
      permission_id : 1 ,
      permission_name : "ezz",
      permission_description : "description" ,
      roles : []
    }
    const fakeRoles = [
      {
        role_id : 1 ,
        role_name : "Hr",
        permissions : [fakePermission]
      },
      {
        role_id : 2 ,
        role_name : "Hr2",
        permissions : [fakePermission]
      }
    ]

    permissionRepo.findOne.mockResolvedValue(fakePermission)
    rolesRepo.find.mockResolvedValue(fakeRoles)
    rolesRepo.save.mockResolvedValue(true)
    permissionRepo.delete.mockResolvedValue(true)
    logsService.logAction(
      user,
      "Delete-Permission",
      "Permission",
      user.user_id,
      `Has Deleted the Permission : [${fakePermission?.permission_name}]`
    )

    const result = await service.deletePermission(user , id)
    expect(result.success).toBe(true);
    expect(result.message).toEqual('Permission deleted successfully')


  
    expect(permissionRepo.findOne).toHaveBeenCalledWith({
      where : { permission_id : Number(id)}
    })
    expect(rolesRepo.find).toHaveBeenCalledWith(
      {
            relations: ['permissions'],
            where: { permissions: { permission_id: Number(id) } },
      }
    )
    // expect(rolesRepo.save).toHaveBeenCalledWith(fakeRoles.map(role => role))
    // expect(permissionRepo.delete).toHaveBeenCalledWith(id)
  })
    


  //get permissions 
  it("should list all the permisison in the db evern if there is none it return emoty array" ,async() =>{
    const fakePermissions = [
      {
        permission_id : 1 ,
        permission_name : "name 1",
        permission_description : "description 1"
      },
      {
        permission_id : 2 ,
        permission_name : "name 2",
        permission_description : "description 2"
      }
    ]

    permissionRepo.find.mockResolvedValue(fakePermissions)

    const result = await service.getPermissions();
    expect(result.success).toBe(true);
    expect(result.permissions).toMatchObject(fakePermissions)

    expect(permissionRepo.find).toHaveBeenCalled()
  })


  //add permissions to role 
  it("should throw bad rewuest errror whe the role id is not valid o0t the permission and invalid too" , async() =>{
    const dto: any = { permissionsIds: [], roleId: "a" };
    const req: any = { user: { user_id: 1 } };

    await expect(service.addPermissionsToRole(dto, req))
      .rejects.toThrow(BadRequestException);

    await expect(service.addPermissionsToRole(dto, req))
      .rejects.toThrow("Missing or invalid 'permissionsIds' array or 'roleId'");
  })
  it("should throw not found error when the role not found" , async() =>{
    const dto : any  = { permissionsIds: ["1"], roleId: "1" };
    const req: any = { user: { user_id: 1 } };
    const roleNumber = Number(dto.roleId)
    rolesRepo.findOne.mockResolvedValue(null);

    await expect(service.addPermissionsToRole(dto,req)).rejects.toThrow(
      new NotFoundException("role not found ")
    )

    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where: { role_id: roleNumber},
      relations: ['permissions'],
    });
  })
  it("should throw bad request error when the permission are not valid to add" , async() =>{
    const dto: any = { permissionsIds: ["1"], roleId: "1" };
    const req: any = { user: { user_id: 1 } };
    const fakeRole = {
      role_id : 1, 
      role_name : "HR" ,
      permissions : [] ,
      users:[]
    }
    const fakePermissions = [
      {
        permission_name :"name 1",
        permission_id : 1
      },
      {
        permission_name :"name 2",
        permission_id : 2
      },
      {
        permission_name :"name 1",
        permission_id : 3
      }
    ]
    rolesRepo.findOne.mockResolvedValue(fakeRole);
    permissionRepo.find.mockResolvedValue(fakePermissions)


    await expect(service.addPermissionsToRole(dto,req)).rejects.toThrow(
      new BadRequestException("One or more permission IDs are invalid")
    )

    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where: { role_id: Number(dto.roleId)},
      relations: ['permissions'],
    });
    expect(permissionRepo.find).toHaveBeenCalledWith(
      {
        where : {permission_id : In(dto.permissionsIds)}
      }
    )

  })
  it("should throw bad request error when the permission are not valid to add" , async() =>{
    const dto: any = { permissionsIds: ["1" , "2" , "3"], roleId: "1" };
    const req: any = { user: { user_id: 1 } };
    const fakeRole = {
      role_id : 1, 
      role_name : "HR" ,
      permissions : [] ,
      users:[]
    }
    const fakePermissions = [
      {
        permission_name :"name 1",
        permission_id : 1
      },
      {
        permission_name :"name 2",
        permission_id : 2
      },
      {
        permission_name :"name 1",
        permission_id : 3
      }
    ]
    rolesRepo.findOne.mockResolvedValue(fakeRole);
    permissionRepo.find.mockResolvedValue(fakePermissions)
    rolesRepo.save.mockResolvedValue(true)
    logsService.logAction(
      req.user , 
      "Add-Permission" , 
      "Permission" , 
      req.user.user_id , 
      `Has Changed the ${fakeRole.role_name} Permissions`
    )

    const result = await service.addPermissionsToRole(dto,req)
    expect(result.success).toBe(true);
    expect(result.message).toEqual("Permissions Added Successfully")
    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where: { role_id: Number(dto.roleId)},
      relations: ['permissions'],
    });
    expect(permissionRepo.find).toHaveBeenCalledWith(
      {
        where : {permission_id : In(dto.permissionsIds)}
      }
    )

  })

  //get role by id 
  it("should throw not found error when the role is not found " , async() => {
    const id = "1"

    rolesRepo.findOne.mockResolvedValue(null);

    await expect(service.getRoleById(id)).rejects.toThrow(
       new NotFoundException("role not found")
    )

    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where : {role_id : Number(id)},
      relations:['permissions']
    })
  })
  it("should return the found role and success " , async() => {
    const id = "1"
    const fakeRole = {
      role_id : 1 ,
      role_name : "HR" ,
      permission : [],
      users : []
    }
    rolesRepo.findOne.mockResolvedValue(fakeRole);

    const result = await service.getRoleById(id);
    expect(result.success).toBe(true);
    expect(result.role).toMatchObject(fakeRole)

    expect(rolesRepo.findOne).toHaveBeenCalledWith({
      where : {role_id : Number(id)},
      relations:['permissions']
    })
  })


  //delete role
  it("should throw not found error whe the role not found" , async()=>{
    const req : any = {}
    const id = "1"

    rolesRepo.findOne.mockResolvedValue(null)

    await expect(service.deleteRole(id , req)).rejects.toThrow(
      new NotFoundException('Role not found')
    )
    expect(rolesRepo.findOne).toHaveBeenCalledWith(
      {
       where : {role_id : Number(id)},
        relations : ['users' , "permissions"] 
      }
    )
  })
  it("should delete role and move all its users to User role , save it and delete the role and ten add log" , async()=>{
    const req : any = {user : {user_id  : 1}}
    const id = "1"
    const fakeUsers = [
      {
        user_id : 1 ,
        user_name : "ezz",
        user_email : "ezz@gmail.com"
      },
      {
        user_id : 2 ,
        user_name : "ezz",
        user_email : "ezz2@gmail.com"
      },
      {
        user_id : 3 ,
        user_name : "ezz",
        user_email : "ezz3@gmail.com"
      }
    ]

    const fakeRole = {
      role_id : 1,
      role_name :"HR" ,
      users : fakeUsers
    }

    const userRole = {
      role_id : 2,
      role_name :"user" ,
      users : []
    }
    rolesRepo.findOne
      .mockResolvedValue(fakeRole)
      .mockResolvedValue(userRole)
    rolesRepo.save.mockResolvedValue(true);
    rolesRepo.delete.mockResolvedValue(true)
    rolesRepo.find.mockResolvedValue([userRole]);


    const result = await service.deleteRole(id, req)
    expect(result).toEqual({
      success: true,
      message: 'Role deleted and users reassigned.',
      roles: [userRole],
    });



    expect(rolesRepo.findOne).toHaveBeenCalledWith(
      {
       where : {role_id : Number(id)},
        relations : ['users' , "permissions"] 
      }
    )
    expect(rolesRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        role_id: 2,
        role_name: "user",
      })
    );
    expect(rolesRepo.delete).toHaveBeenCalledWith(id)
    expect(logsService.logAction).toHaveBeenCalledWith(
      req.user,
      'Delete-Role',
      'Role',
      id,
      `Has Deleted the Role ${userRole.role_name}`
    );

  })


  //create permission alone
  it("should create a permission alone using the name and the description" , async()=>{
    const permissionName = "hh";
    const permissionDescription = "111"
    const fakePermission = {
      permission_name : "hh" ,
      permission_description : "111"
    }
    permissionRepo.create.mockReturnValue(fakePermission)
    permissionRepo.save.mockResolvedValue(fakePermission)

    const result = await service.createPermissionAlone(permissionName , permissionDescription)
      expect(result).toEqual(
        fakePermission
      )
    expect(permissionRepo.create).toHaveBeenCalledWith(
      {
        permission_name: permissionName,
        permission_description: permissionDescription,
      }
    )
    expect(permissionRepo.save).toHaveBeenCalledWith(fakePermission)
  })


  //add permission to role 
  it("should return not found exception when role not found " , async() =>{
    const roleId = 1
    const permissionId = 1

    rolesRepo.findOne.mockResolvedValue(null);

    await expect(service.addPermissionToRole(roleId , permissionId)).rejects.toThrow(
      new NotFoundException("role not found ")
    )

    expect(rolesRepo.findOne).toHaveBeenCalledWith(
      {
        where : {role_id : roleId}
      }
    )
  })
  it("should return not found exception when permission not found " , async() =>{
    const roleId = 1
    const permissionId = 1
    const fakeRole = {
      role_id : 1 ,
      role_name :"HR" , 
      user : [] ,
      perrmissions: []
    }
    rolesRepo.findOne.mockResolvedValue(fakeRole);
    permissionRepo.findOne.mockResolvedValue(null)
    await expect(service.addPermissionToRole(roleId , permissionId)).rejects.toThrow(
      new NotFoundException("permission not found")
    )

    expect(rolesRepo.findOne).toHaveBeenCalledWith(
      {
        where : {role_id : roleId}
      }
    )


    expect(permissionRepo.findOne).toHaveBeenCalledWith(
      {
        where : {permission_id : permissionId}
      }
    )
  })
  it("should add permission to the role and return success" , async() =>{
    const roleId = 1
    const permissionId = 1

    const fakePermisison = {
      permission_id : 1,
      permission_name : "testing" ,
      permission_description : "testing"
    }
    const fakeRole = {
      role_id : 1 ,
      role_name :"HR" , 
      user : [] ,
      permissions: []
    }

    rolesRepo.findOne.mockResolvedValue(fakeRole);
    permissionRepo.findOne.mockResolvedValue(fakePermisison)
    const newRole = {
      ...fakeRole ,
      permissions : [fakePermisison]
    }
    rolesRepo.save.mockResolvedValue(newRole)

    const result =await service.addPermissionToRole(roleId , permissionId)
    expect(result).toMatchObject(newRole)

    expect(rolesRepo.findOne).toHaveBeenCalledWith(
      {
        where : {role_id : roleId}
      }
    )


    expect(permissionRepo.findOne).toHaveBeenCalledWith(
      {
        where : {permission_id : permissionId}
      }
    )
  })
});
