import { IsMongoId } from "class-validator";

export class UserIdParameterDto{
    @IsMongoId({ message: 'Invalid userId format' })
    userId: string;
}