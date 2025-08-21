import { forwardRef, Module } from '@nestjs/common';
import { ComplaintController } from './complaint.controller';
import { ComplaintService } from './complaint.service';
import { Complaint, ComplaintSchema } from './schemas/complaint.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ComplaintGroupsRule, ComplaintGroupsRuleSchema } from './schemas/complaint-groups-rule.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { LogsModule } from 'src/logs/logs.module';
import { CheckTokenGaurd } from 'src/gaurds/check-token-gaurd.gaurd';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintEntity } from './entities/complaint.entity';
import { ComplaintGroupsRuleEntity } from './entities/complaint-groups-rule.entity';
import { UserModule } from '../user/user.module';
import { RolesModule } from '../roles/roles.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
    imports:[
        MongooseModule.forFeature([
            {name : Complaint.name , schema : ComplaintSchema } ,
            {name : ComplaintGroupsRule.name , schema : ComplaintGroupsRuleSchema} ,
            {name : User.name , schema : UserSchema} ,
            {name :Group.name , schema : GroupSchema} , 
            {name : Role.name , schema : RoleSchema}
        ]),
        forwardRef(() => LogsModule),  
        forwardRef(() => UserModule),
        RolesModule, 
        GroupsModule,
        TypeOrmModule.forFeature([
            ComplaintEntity ,
            ComplaintGroupsRuleEntity
        ])
    ],
    controllers:[ComplaintController],
    providers : [ComplaintService , JwtService],
    exports:[TypeOrmModule]
})
export class ComplaintModule {}
