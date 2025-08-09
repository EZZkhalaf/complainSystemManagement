import { Body, Controller, Get, Post, Put, Query, Res, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { SendOtpDto } from './dtos/send-otp.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { ChangeOtpPasswordDto } from './dtos/change-otp-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService){}

    @Post("register")
    async register(@Body() registerDto : RegisterDto){
        return this.authService.register(registerDto);
    }

    @Get("verify-email")
    async verifyEmail(@Query("token") token : string ){
        return this.authService.verifyEmail(token)
    }

    @Post("login")
    async login(@Body() loginDto : LoginDto){
        return this.authService.login(loginDto)
    }


    @Post("send-otp-to-email")
    async sendOtp(@Body() body : SendOtpDto){
        return this.authService.sendOtp(body);
    }

    @Post("verify-otp")
    async verifyOtp(@Body() otpDto : VerifyOtpDto , @Res() res : Response){
        return this.authService.verifyOtp(otpDto.email, otpDto.otp);
    }

    @Put("change-password-otp")
    async changeOtpPassword(@Body() changeOtpDto : ChangeOtpPasswordDto){
        return this.authService.changeOTPPassword(changeOtpDto)
    }

    

}
