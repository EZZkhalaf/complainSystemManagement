import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserController } from './user.controller';

describe('UserService', () => {
  let controller: UserController;

  const fakeUserService = {

  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers : [UserController],
      providers: [UserService],
    }).overrideProvider(UserService).useValue(fakeUserService).compile();

    controller = module.get<UserController>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
