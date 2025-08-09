import { IsNotEmpty, IsString } from "class-validator";

export class ListComplaintsDto{
    @IsNotEmpty()
    @IsString()
    id: string
}