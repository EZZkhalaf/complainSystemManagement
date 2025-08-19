import { Body, Controller, Get, Post, Put, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { SendOtpDto } from './dtos/send-otp.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { ChangeOtpPasswordDto } from './dtos/change-otp-password.dto';
import type { Response } from 'express';
import { CheckTokenGaurd } from '../gaurds/check-token-gaurd.gaurd';

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
    async login(@Body() loginDto : LoginDto , @Res({passthrough : true}) res : Response , @Req() req : any){
        const {token , user} = await  this.authService.login(loginDto)
        
        
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            path: "/", // ensure full overwrite
            maxAge: 10 * 24 * 60 * 60 * 1000,
        });


        // If you want to use cookie-session too:
        req.session = req.session || {};
        req.session.token = token;
        
        
        return  {
            success: true,
            message: 'Login successful',
            user: user,
            
        }

    }

    @Get("me")
    @UseGuards(CheckTokenGaurd)
    async  getLoggedInUser(@Req() req : any) {
        if (!req.user) {
            throw new UnauthorizedException('User not found on request');
        }
        const userId = req.user.user_id
        return  this.authService.fetchLoggedInUser(userId);
       
    }

    @Post("logout")
    async logout(@Res() res : Response){
        return this.authService.logout(res);
    }


    @Post("send-otp-to-email")
    async sendOtp(@Body() body : SendOtpDto){
        return this.authService.sendOtp(body);
    }

    @Post("verify-otp")
    async verifyOtp(@Body() otpDto : VerifyOtpDto , @Res() res : Response){
        const result = await this.authService.verifyOtp(otpDto.email, otpDto.otp);
        return res.status(200).json(result)
    }

    @Put("change-password-otp")
    async changeOtpPassword(@Body() changeOtpDto : ChangeOtpPasswordDto){
        return this.authService.changeOTPPassword(changeOtpDto)
    }

    

}
