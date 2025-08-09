import { Module } from '@nestjs/common';
import { ComplaintController } from './complaint.controller';
import { ComplaintService } from './complaint.service';
import { Complaint, ComplaintSchema } from './schemas/complaint.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ComplaintGroupsRule, ComplaintGroupsRuleSchema } from './schemas/complaint-groups-rule.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Group, GroupSchema } from 'src/groups/schemas/group.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';

@Module({
    imports:[
        MongooseModule.forFeature([
            {name : Complaint.name , schema : ComplaintSchema } ,
            {name : ComplaintGroupsRule.name , schema : ComplaintGroupsRuleSchema} ,
            {name : User.name , schema : UserSchema} ,
            {name :Group.name , schema : GroupSchema} , 
            {name : Role.name , schema : RoleSchema}
        ])
    ],
    controllers:[ComplaintController],
    providers : [ComplaintService]
})
export class ComplaintModule {}
