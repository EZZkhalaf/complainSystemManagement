import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PremissionSchema } from './schemas/permission.schema';
import { LogsModule } from 'src/logs/logs.module';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from 'src/user/schemas/user.schema';

@Module({
  imports :[
    MongooseModule.forFeature([
      {name : Role.name , schema : RoleSchema},
      {name : User.name , schema : UserSchema},
      {name : Permission.name , schema : PremissionSchema}
    ]),
    LogsModule
  ],
  controllers: [RolesController],
  providers: [RolesService , JwtService]
})
export class RolesModule {}
