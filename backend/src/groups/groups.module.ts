import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Complaint, ComplaintSchema } from 'src/complaint/schemas/complaint.schema';
import { ComplaintGroupsRule, ComplaintGroupsRuleSchema } from 'src/complaint/schemas/complaint-groups-rule.schema';
import { LogsModule } from 'src/logs/logs.module';
import { JwtService } from '@nestjs/jwt';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';

@Module({
  imports : [
    MongooseModule.forFeature([
      {name : Group.name , schema : GroupSchema} ,
      {name : User.name , schema : UserSchema} , 
      {name : Role.name , schema : RoleSchema},
      {name :Complaint.name , schema : ComplaintSchema} ,
      {name : ComplaintGroupsRule.name , schema : ComplaintGroupsRuleSchema}
    ]) ,
    LogsModule
  ],
  controllers: [GroupsController],
  providers: [GroupsService , JwtService]
})
export class GroupsModule {}
