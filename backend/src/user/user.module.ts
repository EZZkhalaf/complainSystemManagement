import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import { Group, GroupSchema } from 'src/groups/schemas/group.schema';
import { Complaint, ComplaintSchema } from 'src/complaint/schemas/complaint.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name : User.name , schema : UserSchema} , 
      {name : Role.name , schema:RoleSchema} ,
      {name : Group.name , schema : GroupSchema},
      {name : Complaint.name , schema : ComplaintSchema}
    ])
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
