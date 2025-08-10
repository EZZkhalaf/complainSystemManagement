import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import { Group, GroupSchema } from 'src/groups/schemas/group.schema';
import { Complaint, ComplaintSchema } from 'src/complaint/schemas/complaint.schema';
import { LogsModule } from 'src/logs/logs.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name : User.name , schema : UserSchema} , 
      {name : Role.name , schema:RoleSchema} ,
      {name : Group.name , schema : GroupSchema},
      {name : Complaint.name , schema : ComplaintSchema}
    ]),
    LogsModule
  ],
  controllers: [UserController],
  providers: [UserService ,JwtService ]
})
export class UserModule {}
