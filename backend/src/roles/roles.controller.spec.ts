import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RolesEntity } from './entities/roles.entity';
import { UserEntity } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { PermissionEntity } from './entities/permission.entity';
import { CheckTokenGaurd } from '../gaurds/check-token-gaurd.gaurd';
import { CheckPermissionGaurd } from '../gaurds/check-permission.gaurd';

describe('RolesController', () => {
  let controller: RolesController;
  let rolesService: RolesService;

  const mockRolesService = {
    addNewRole: jest.fn(),
    getRoles: jest.fn(),
    addPermissions: jest.fn(),
    deletePermission: jest.fn(),
    getPermissions: jest.fn(),
    addPermissionsToRole: jest.fn(),
    getRoleById: jest.fn(),
    deleteRole: jest.fn(),
    createRoleWithPermissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: RolesService, useValue: mockRolesService },
        { provide: JwtService, useValue: { verify: jest.fn(), sign: jest.fn() } },
        { provide: getRepositoryToken(PermissionEntity), useValue: {} },
        { provide: getRepositoryToken(RolesEntity), useValue: {} },
      ],
    }).overrideGuard(CheckTokenGaurd) 
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(CheckPermissionGaurd) 
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<RolesController>(RolesController);
    rolesService = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call RolesService.addNewRole when addNewRole is called', async () => {
    const req: any = { user: { user_id: 1 } };
    const body = { newRole: 'admin' };

    mockRolesService.addNewRole.mockResolvedValue('ok');

    const result = await controller.addNewRole(body, req);

    expect(result).toBe('ok');
    expect(mockRolesService.addNewRole).toHaveBeenCalledWith(req, body.newRole);
  });
});
