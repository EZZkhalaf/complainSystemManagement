import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PremissionSchema } from './schemas/permission.schema';

@Module({
  imports :[
    MongooseModule.forFeature([
      {name : Role.name , schema : RoleSchema},
      {name : Permission.name , schema : PremissionSchema}
    ])
  ],
  controllers: [RolesController],
  providers: [RolesService]
})
export class RolesModule {}
