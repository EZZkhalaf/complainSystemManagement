import { Type } from 'class-transformer';
import { ValidateNested, ArrayNotEmpty, IsArray } from 'class-validator';
import { PermissionDto } from './permissions.dto';


export class CreatePermissionDto {
    name: string;
    description: string;
}
