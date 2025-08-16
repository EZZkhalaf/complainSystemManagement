import { IsNotEmpty, IsNumberString } from "class-validator";

export class AddUserToGroupDto {
  @IsNotEmpty()
  @IsNumberString({}, { message: 'groupId must be a number string' })
  groupId: string;

  @IsNotEmpty()
  @IsNumberString({}, { message: 'userId must be a number string' })
  userId: string;
}
