import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ChangeOtpPasswordDto{
    
    @IsEmail()
    @IsNotEmpty()
    email:string ;

    @IsNotEmpty()
    @IsString()
    newPassword : string ;



    @IsString()
    @IsNotEmpty()
    token: string

}