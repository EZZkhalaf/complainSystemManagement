import { IsMongoId, IsNotEmpty, IsNumberString } from 'class-validator';

export class AddGroupToRuleDto {
  // @IsMongoId()
  // id: string;

  // @IsMongoId()
  @IsNotEmpty()
  @IsNumberString()
  groupId: string;
}
