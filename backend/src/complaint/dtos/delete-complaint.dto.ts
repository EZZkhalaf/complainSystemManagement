import { IsMongoId } from "class-validator";

export class DeleteComplaintDto{
    
    @IsMongoId()
    complaintId : string;;
}