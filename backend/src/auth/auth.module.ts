import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OTPSchema } from './schemas/OTP.schema';
import { TempSession, TempSessionSchema } from './schemas/tempSession.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import { Group, GroupSchema } from 'src/groups/schemas/group.schema';
import { LogsService } from 'src/logs/logs.service';
import { Logs, LogsSchema } from 'src/logs/schemas/logs.schema';
import { LogsModule } from 'src/logs/logs.module';
import { Complaint, ComplaintSchema } from 'src/complaint/schemas/complaint.schema';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTPEntity } from './entities/OTP.entity';
import { TempSessionEntity } from './entities/tempSession.entity';
import { UserModule } from 'src/user/user.module';
import { GroupsModule } from 'src/groups/groups.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports : [
    MongooseModule.forFeature([
      {name : User.name , schema : UserSchema},
      {name : Role.name , schema : RoleSchema},
      {name : OTP.name , schema : OTPSchema} ,
      {name : TempSession.name , schema : TempSessionSchema},
      {name : Group.name , schema : GroupSchema},
      {name : Logs.name , schema : LogsSchema},
      {name : Complaint.name , schema : ComplaintSchema}
    ]) ,
    forwardRef(()=>LogsModule),UserModule , GroupsModule, RolesModule,
    TypeOrmModule.forFeature([
      OTPEntity , TempSessionEntity
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService ,JwtService ],
  exports : [TypeOrmModule]
})
export class AuthModule {}
