// src/user/dto/user-output.dto.ts
import { Expose, Type } from "class-transformer";
import { RolesEntity } from "src/roles/entities/roles.entity";

export class UserOutputDto {
  @Expose()
  user_id: number;

  @Expose()
  user_name: string;

  @Expose()
  user_email: string;

  @Expose()
  profilePicture: string;

  @Expose()
  created_at: Date;

  // role is included, but no password
  @Expose()
  @Type(() => RolesEntity) 
  user_role: RolesEntity; 
}
