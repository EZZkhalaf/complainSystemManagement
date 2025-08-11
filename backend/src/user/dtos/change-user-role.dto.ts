// dto/change-user-role.dto.ts
import { IsMongoId, IsString, IsNotEmpty } from 'class-validator';

export class ChangeUserRoleDto {
  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  newRole: string;
}
