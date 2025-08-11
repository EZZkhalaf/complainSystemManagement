// import { IsEmail, IsMongoId, IsString, min, MinLength } from "class-validator"

// export class AdminEditUserInfoDto{
//     @IsMongoId()
//      userId:string
//     @IsString()
//     newName:string

//     @IsEmail()
//     newEmail:string
    
//     @IsString()
//     @MinLength(6)
//     newPassword :string
// }

import { IsEmail, IsMongoId, IsOptional, IsString, MinLength, IsArray } from "class-validator";

export class AdminEditUserInfoDto {
    @IsMongoId()
    userId: string;

    @IsString()
    @IsOptional()
    newName?: string;

    @IsEmail()
    @IsOptional()
    newEmail?: string;

    @IsString()
    @MinLength(6)
    @IsOptional()
    newPassword?: string;

    
}
