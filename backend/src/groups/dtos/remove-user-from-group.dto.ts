import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RemoveUserFromGroupDto {
  @Type(() => Number) // Converts from string to number
  @IsInt({ message: 'groupId must be an integer' })
  @Min(1, { message: 'groupId must be greater than 0' })
  groupId: number;

  @Type(() => Number)
  @IsInt({ message: 'userId must be an integer' })
  @Min(1, { message: 'userId must be greater than 0' })
  userId: number;
}
