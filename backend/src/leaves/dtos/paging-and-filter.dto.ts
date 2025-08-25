import { IsNumberString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { LeaveStatus, LeaveType } from '../entities/leaves.entity';


export class PaginAndFilterDto {
  @IsNumberString()
  currentPage: string;

  @IsNumberString()
  leavesPerPage: string;

  @IsOptional()
  @IsEnum(LeaveStatus, { message: 'Invalid leave status' })
  leave_status?: LeaveStatus;

  @IsOptional()
  @IsEnum(LeaveType, { message: 'Invalid leave type' })
  leave_type?: LeaveType;

  @IsOptional()
  @IsDateString({}, { message: 'date_from must be a valid date string (YYYY-MM-DD)' })
  date_from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'date_to must be a valid date string (YYYY-MM-DD)' })
  date_to?: string;
}
