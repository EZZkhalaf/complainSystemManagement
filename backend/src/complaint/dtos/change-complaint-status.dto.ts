// src/complaint/dto/change-complaint-status.dto.ts
import { IsMongoId, IsString } from 'class-validator';

export class ChangeComplaintStatusDto {
  @IsMongoId()
  complaintId: string;

  @IsMongoId()
  userId: string;

  @IsMongoId()
  groupId: string;

  @IsString()
  status: string; // you can restrict values if needed
}
