// dto/add-permissions-to-role.dto.ts
import { IsArray, ArrayNotEmpty, IsMongoId, IsString } from 'class-validator';

export class AddPermissionsToRoleDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  permissionsIds: string[];

  @IsString()
  @IsMongoId()
  roleId: string;
}
