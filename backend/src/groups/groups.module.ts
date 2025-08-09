import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Complaint, ComplaintSchema } from 'src/complaint/schemas/complaint.schema';
import { ComplaintGroupsRule, ComplaintGroupsRuleSchema } from 'src/complaint/schemas/complaint-groups-rule.schema';

@Module({
  imports : [
    MongooseModule.forFeature([
      {name : Group.name , schema : GroupSchema} ,
      {name : User.name , schema : UserSchema} , 
      {name :Complaint.name , schema : ComplaintSchema} ,
      {name : ComplaintGroupsRule.name , schema : ComplaintGroupsRuleSchema}
    ])
  ],
  controllers: [GroupsController],
  providers: [GroupsService]
})
export class GroupsModule {}
