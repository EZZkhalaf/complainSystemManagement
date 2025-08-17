// src/groups/dto/group-output.dto.ts
import { Expose, Type } from "class-transformer";
import { UserOutputDto } from "src/user/dtos/user-output.dto";

export class GroupOutputDto {
  @Expose() group_id: number;
  @Expose() group_name: string;
  @Expose() created_at: Date;

  @Expose()
  @Type(()=>UserOutputDto)  
  users : UserOutputDto[]
}
