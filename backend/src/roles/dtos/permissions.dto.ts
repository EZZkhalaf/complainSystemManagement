// dto/create-permission.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class PermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
