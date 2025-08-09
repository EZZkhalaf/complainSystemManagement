import { IsMongoId } from 'class-validator';

export class AddGroupToRuleDto {
  @IsMongoId()
  id: string;

  @IsMongoId()
  groupId: string;
}
