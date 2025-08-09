import { IsString, IsNotEmpty, IsIn } from 'class-validator';
export class HandleComplaintInGroupDto{
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(['pending' , 'in-progress' , "resolved" , "rejected"], {
        message: "status must be either 'pending' , 'in-progress' , 'resolved' , 'rejected' ",
    })
    status: string;
}