import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { LeaveStatus, LeaveType } from "../entities/leaves.entity";

export class AddLeaveDto {

    @IsString()
    @IsNotEmpty()
    leave_description : string ;

    @IsString()
    @IsIn(['general' , 'sick' , 'personal' ],{
            message: "leave type must be 'general' , 'sick' , 'personal' ",
        })
    leave_type : LeaveType ;

    
    
}