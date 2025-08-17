// src/complaint/dto/complaint-output.dto.ts
import { Expose, Type } from "class-transformer";
import { ComplaintStatus, ComplaintType } from "../entities/complaint.entity";
import { UserOutputDto } from "src/user/dtos/user-output.dto";

export class ComplaintOutputDto {
  @Expose() complaint_id: number;

  @Expose()
  @Type(() => UserOutputDto)
  creator_user: UserOutputDto;

  @Expose() description: string;
  @Expose() complaint_status: ComplaintStatus;
  @Expose() complaint_type: ComplaintType;
  @Expose() created_at: Date;
  @Expose() updated_at: Date;
}
