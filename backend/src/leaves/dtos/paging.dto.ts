import { IsNumberString } from "class-validator";

export class PagingDto {

    @IsNumberString()
    currentPage : string;

    @IsNumberString()
    leavesPerPage : string
}