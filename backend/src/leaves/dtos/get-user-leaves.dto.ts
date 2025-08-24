import { ApiProperty } from '@nestjs/swagger';

export class LeaveItemDto {
  @ApiProperty()
  leave_id: number;

  @ApiProperty()
  leave_description: string;

  @ApiProperty()
  leave_status: string;

  @ApiProperty()
  leave_type: string;

  @ApiProperty()
  created_at: string; 

  @ApiProperty()
  updated_at: string; 

  @ApiProperty()
  leave_user_name: string;

  @ApiProperty()
  leave_handler_name: string;
}

export class GetUserLeavesDto {
  @ApiProperty()
  user_id: number;

  @ApiProperty()
  user_name: string;

  @ApiProperty({ type: [LeaveItemDto] })
  leaves: LeaveItemDto[];

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  leavesPerPage: number;

  @ApiProperty()
  totalLeaves: number;
}
