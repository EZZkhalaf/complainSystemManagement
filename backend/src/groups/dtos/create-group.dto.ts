
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateGroupDto{
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(5, { message: 'Description must be at least 5 characters long' })
    description: string;
}