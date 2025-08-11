import { IsMongoId } from "class-validator";

export class AddUserToGroupDto{
    @IsMongoId()
    groupId : string ;

    
    @IsMongoId()
    userId :  string;
}