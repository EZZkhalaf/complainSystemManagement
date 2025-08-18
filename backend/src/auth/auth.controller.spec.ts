import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { register } from 'module';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

import { UserEntity } from '../user/entities/user.entity';
import { GroupEntity } from '../groups/entities/group.entity';
import { RolesEntity } from '../roles/entities/roles.entity';
import { OTPEntity } from './entities/OTP.entity';
import { TempSessionEntity } from './entities/tempSession.entity';
import { LogsService } from '../logs/logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';


describe('AuthController', () => {
  let controller: AuthController;
  let service : AuthService;

  let logsService : {
    logAction : jest.Mock
  }
  const mockAuthService = {
    login : jest.fn() ,
    register : jest.fn()
  }

  const mockJwtService = {
    sign : jest.fn(),
    verify : jest.fn()
  }
  let userRepo: { 
    findOne: jest.Mock ,
    create : jest.Mock,
    save : jest.Mock
  };
  let rolesRepo : {
    findOne : jest.Mock,
    create : jest.Mock ,
    save : jest.Mock,
    createQueryBuilder:jest.Mock
  }
  let groupsRepo :{
    createQueryBuilder : jest.Mock
  }
  
  beforeEach(async () => {

    userRepo = { 
        findOne: jest.fn() ,
        create : jest.fn() ,
        save : jest.fn(),
      };
      rolesRepo = {
        findOne : jest.fn(),
        create: jest.fn(),
        save : jest.fn(),
        createQueryBuilder : jest.fn()
      }

      logsService = {logAction : jest.fn()}

      groupsRepo = {
        createQueryBuilder : jest.fn()
      }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers:[
        {
          provide : AuthService ,
          useValue : mockAuthService
        },
        {
          provide : JwtService ,
          useValue : mockJwtService
        },
        { provide: LogsService, useValue: logsService },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: groupsRepo },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        { provide: getRepositoryToken(OTPEntity), useValue: {} },
        { provide: getRepositoryToken(TempSessionEntity), useValue: {} },
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
