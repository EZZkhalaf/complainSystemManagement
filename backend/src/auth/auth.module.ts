import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OTPSchema } from './schemas/OTP.schema';
import { TempSession, TempSessionSchema } from './schemas/tempSession.schema';

@Module({
  imports : [
    MongooseModule.forFeature([
      {name : OTP.name , schema : OTPSchema} ,
      {name : TempSession.name , schema : TempSessionSchema}
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
