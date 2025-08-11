import { Module } from '@nestjs/common';
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
    LogsModule
  ],
  controllers: [AuthController],
  providers: [AuthService ,JwtService ]
})
export class AuthModule {}
