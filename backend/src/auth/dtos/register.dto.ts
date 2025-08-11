import {IsEmail, IsNotEmpty, IsString, MinLength} from 'class-validator' 


export class RegisterDto{

    @IsNotEmpty()
    @IsString()
    name : string ;


    @IsNotEmpty()
    @IsEmail()
    email : string ;


    @MinLength(6)
        @IsString()

    password : string 
}