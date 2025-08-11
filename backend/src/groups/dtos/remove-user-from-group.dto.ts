import { IsMongoId } from 'class-validator';

export class RemoveUserFromGroupDto {
  @IsMongoId({ message: 'Invalid groupId format' })
  groupId: string;

  @IsMongoId({ message: 'Invalid userId format' })
  userId: string;
}
