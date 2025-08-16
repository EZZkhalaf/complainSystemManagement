// dto/change-user-role.dto.ts
import { IsMongoId, IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class ChangeUserRoleDto {
  // @IsMongoId()
  @IsNotEmpty()
    @IsNumberString({}, { message: 'userId must be a number string' })
  userId: string;

  @IsString()
  @IsNotEmpty()
  newRole: string;
}
