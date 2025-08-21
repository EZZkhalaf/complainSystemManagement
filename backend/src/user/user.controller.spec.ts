import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { RolesEntity } from '../roles/entities/roles.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    editUserInfo: jest.fn(),
    adminEditUserInfo: jest.fn(),
    getUserById: jest.fn(),
    changeUserRole: jest.fn(),
    deleteUser: jest.fn(),
    verifyEmailUpdate: jest.fn(),
    // add other service methods as needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: { verify: jest.fn(), sign: jest.fn() } },
        { provide: getRepositoryToken(UserEntity), useValue: {} },
        { provide: getRepositoryToken(RolesEntity), useValue: {} },
      ],
    })
    .overrideGuard('CheckTokenGaurd') // bypass guard
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // it('should call editUserInfo on UserService', async () => {
  //   const body : any  = { newName: 'ezz', newEmail: 'test@gmail.com' };
  //   const file = null;
  //   const currentUser = { user_id: 1 };

  //   mockUserService.editUserInfo.mockResolvedValue({ success: true });

  //   const result = await controller.editEmployeeInfo('1', body, file, currentUser);

  //   expect(result).toEqual({ success: true });
  //   expect(mockUserService.editUserInfo).toHaveBeenCalledWith('1', body, file, currentUser);
  // });
});
