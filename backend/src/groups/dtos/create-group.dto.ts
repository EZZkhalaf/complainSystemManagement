
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateGroupDto{
    @IsNotEmpty()
    @IsString()
    @MinLength(3, { message: 'Group name must be at least 3 characters long' })
    name: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(5, { message: 'Description must be at least 5 characters long' })
    description: string;
}