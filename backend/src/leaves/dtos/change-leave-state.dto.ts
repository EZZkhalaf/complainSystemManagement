import { IsNumberString, IsString } from "class-validator";

export class ChangeLeaveStateDto{
    @IsString()
    @IsNumberString()
    leave_handler_id : string;

    @IsString()
    new_state : string
}