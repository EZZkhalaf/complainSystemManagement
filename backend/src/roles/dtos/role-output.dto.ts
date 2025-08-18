import { Expose } from "class-transformer";

export class RoleOutputDto{
    @Expose()
    role_name : string ;

    @Expose()
    role_id
}