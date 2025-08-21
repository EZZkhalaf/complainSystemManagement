import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { RolesEntity } from '../roles/entities/roles.entity';
import { NotFoundException } from '@nestjs/common';

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
    getSummaryCharts : jest.fn()
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

  it('should call get summary data for the charts', async () => {
    const id = "1"
    const mockResult = {
      success: true,
      complaintsPerCategory: [{ complaint_type: 'general', total: 3 }],
      commontComplaintsTypes: [{ complaint_type: 'network', total: 5 }],
    };

    mockUserService.getSummaryCharts.mockResolvedValue(mockResult)
    const result = await controller.getSummaryCharts(id);

    expect(mockUserService.getSummaryCharts).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockResult);
  });

  it('should throw if service throws', async () => {
    mockUserService.getSummaryCharts.mockRejectedValue(
      new NotFoundException("error getting the summary of the complaints"),
    );

    await expect(controller.getSummaryCharts('1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
