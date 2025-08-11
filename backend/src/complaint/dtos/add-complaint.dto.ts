import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AddComplaintDto{
    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(['general' , 'technical' , 'billing' , 'other'],{
        message: "complaint type must be 'general' , 'technical' , 'billing' , 'other' ",
    })
    type: string;
}