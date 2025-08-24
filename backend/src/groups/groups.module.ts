import { forwardRef, Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Complaint, ComplaintSchema } from 'src/complaint/schemas/complaint.schema';
import { ComplaintGroupsRule, ComplaintGroupsRuleSchema } from 'src/complaint/schemas/complaint-groups-rule.schema';
import { LogsModule } from 'src/logs/logs.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { UserModule } from 'src/user/user.module';
import { RolesModule } from 'src/roles/roles.module';
import { ComplaintModule } from 'src/complaint/complaint.module';
import { LeavesModule } from 'src/leaves/leaves.module';

@Module({
  imports : [
    forwardRef(()=>LogsModule),
    forwardRef(()=>UserModule),
    forwardRef(()=>ComplaintModule),
    forwardRef(()=>LeavesModule),
    RolesModule,
    TypeOrmModule.forFeature([
      GroupEntity
    ])
  ],
  controllers: [GroupsController],
  providers: [GroupsService , JwtService],
  exports:[TypeOrmModule]
})
export class GroupsModule {}
