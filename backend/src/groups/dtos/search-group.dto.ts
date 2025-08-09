import { IsNotEmpty, IsString } from "class-validator";

export class SearchGroupDto{

    @IsString()
    @IsNotEmpty()
    search : string
}