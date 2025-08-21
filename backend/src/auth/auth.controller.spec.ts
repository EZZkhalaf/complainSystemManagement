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
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';


describe('AuthController', () => {
  let controller: AuthController;
  let service : AuthService;

  let logsService : {
    logAction : jest.Mock
  }
  const mockAuthService: jest.Mocked<AuthService> = {
    login: jest.fn(),
    register: jest.fn(),
    verifyEmail: jest.fn(),  
  };

  const mockRes = () => ({
    cookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({ session: {} });


  const mockJwtService  = {
    sign : jest.fn(),
    verifyEmail : jest.fn(),

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

  //register
  it("should call register service with correct params" , async() =>{
    const dto : RegisterDto = {email : "test@gmail.com" , password  : "123456" , name : "ezz"}
    const result  = { success: true, message: 'Verification email sent.' };

    (service.register as jest.Mock).mockResolvedValue(result)
    const response =  await controller.register(dto)
    expect(service.register).toHaveBeenCalledWith(dto);
    expect(response).toEqual(result);
  })

  //verify email
  it('should call verifyEmail service with correct token', async () => {
    const token = 'valid-token';
    const result = { success: true, message: 'Email verified successfully.' };

    // mock the service method
    service.verifyEmail.mockResolvedValue(result);

    const response = await controller.verifyEmail(token);

    expect(service.verifyEmail).toHaveBeenCalledWith(token);
    expect(response).toEqual(result);
  });

  //login
  it("should calll login and set cookie + session " , async() =>{
    const loginDto: LoginDto = { email: 'test@test.com', password: '123456' };
    const req = mockReq();
    const res = mockRes();

    const loginResult = { token: 'abc123', user: { id: 1, email: 'test@test.com' } };
    (service.login as jest.Mock).mockResolvedValue(loginResult);

    const result = await controller.login(loginDto, res as any, req as any);

    expect(service.login).toHaveBeenCalledWith(loginDto);
    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      'abc123',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(req.session.token).toBe('abc123');
    expect(result).toEqual({
      success: true,
      message: 'Login successful',
      user: loginResult.user,
    });
  })

  
});

