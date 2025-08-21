import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { Complaint, ComplaintSchema } from '../complaint/schemas/complaint.schema';
import { LogsModule } from '../logs/logs.module';
import { JwtService } from '@nestjs/jwt';
import { RolesModule } from '../roles/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { GroupsModule } from '../groups/groups.module';
import { ComplaintModule } from '../complaint/complaint.module';
import { LeavesModule } from '../leaves/leaves.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name : User.name , schema : UserSchema} , 
      {name : Role.name , schema:RoleSchema} ,
      {name : Group.name , schema : GroupSchema},
      {name : Complaint.name , schema : ComplaintSchema}
    ]),
    forwardRef(()=>LogsModule),
     RolesModule ,GroupsModule ,
     forwardRef(()=> LeavesModule),
     forwardRef(() =>  ComplaintModule),
    TypeOrmModule.forFeature([
       UserEntity
    ])
  ],
  controllers: [UserController],
  providers: [UserService ,JwtService ],
  exports:[TypeOrmModule]
})
export class UserModule {}
