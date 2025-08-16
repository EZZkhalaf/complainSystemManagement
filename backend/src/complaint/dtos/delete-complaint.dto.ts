import { IsMongoId, IsNumberString } from "class-validator";

export class DeleteComplaintDto{
    
    // @IsMongoId()
    // @IsNumberString()
    complaintId : string;
}