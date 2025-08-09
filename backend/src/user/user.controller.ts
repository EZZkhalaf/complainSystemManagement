import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService, UserWithRole } from './user.service';
import { ChangeUserRoleDto } from './dtos/change-user-role.dto';
import { AddUserToGroupDto } from './dtos/add-user-to-group.dto';

@Controller('user')
export class UserController {

    constructor(private readonly userService : UserService){}


    @Post("changeRole")
    async changeUserRole(@Body() dto : ChangeUserRoleDto){
        return this.userService.changeUserRole(dto)
    }


    @Get()
    async fetchUsers(){
        return this.userService.fetchUsers();
    }

    @Get("getUsersRoleEdition")
    async fetchUsersRoleEditionController(): Promise<{ success: boolean; users: UserWithRole[]; roles2: any }>{
        return this.userService.fetchUsersRoleEdition()
    }

    @Post("add")
    async addUserToGroup(@Body() dto : AddUserToGroupDto){
        return this.userService.addUserToGroup(dto)
    }

    @Get("getSummary/:id")
    async getSummary(@Param("id") id : string){
        return this.userService.getSummary(id);
    }

}
