// src/user/dto/user-output.dto.ts
import { Exclude, Expose } from "class-transformer";
import { RolesEntity } from "../../roles/entities/roles.entity";

export class UserOutputDto {
  @Expose() user_id: number;
  @Expose() user_name: string;
  @Expose() user_email: string;
  @Expose() profilePicture: string;
  @Expose() created_at: Date;

  @Expose() user_role : RolesEntity

  @Exclude() user_password: string;
}
