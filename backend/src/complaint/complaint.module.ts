import { Module } from '@nestjs/common';
import { ComplaintController } from './complaint.controller';
import { ComplaintService } from './complaint.service';
import { Complaint, ComplaintSchema } from './schemas/complaint.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ComplaintGroupsRule, ComplaintGroupsRuleSchema } from './schemas/complaint-groups-rule.schema';

@Module({
    imports:[
        MongooseModule.forFeature([
            {name : Complaint.name , schema : ComplaintSchema } ,
            {name : ComplaintGroupsRule.name , schema : ComplaintGroupsRuleSchema}
        ])
    ],
    controllers:[ComplaintController],
    providers : [ComplaintService]
})
export class ComplaintModule {}
