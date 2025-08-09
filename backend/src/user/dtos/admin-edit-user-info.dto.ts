import { IsEmail, IsMongoId, IsString, min, MinLength } from "class-validator"

export class AdminEditUserInfoDto{
    @IsMongoId()
     userId:string
    @IsString()
    newName:string

    @IsEmail()
    newEmail:string
    
    @IsString()
    @MinLength(6)
    newPassword :string
}