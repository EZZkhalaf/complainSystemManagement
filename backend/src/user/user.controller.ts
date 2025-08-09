import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService, UserWithRole } from './user.service';
import { ChangeUserRoleDto } from './dtos/change-user-role.dto';
import { AddUserToGroupDto } from './dtos/add-user-to-group.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/multer.config';
import { AdminEditUserInfoDto } from './dtos/admin-edit-user-info.dto';
import type { Response } from 'express';

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

    @Put("editInfo/:id")
    @UseInterceptors(FileInterceptor("profilePicture" , multerConfig))
    async editEmployeeInfo(
        @Param("id") id : string ,
        @UploadedFile() file : Express.Multer.File ,
        @Body() body : any ,
        @Req() req : any
    ){
        return this.userService.editUserInfo(id, body, file, req.user)
    }

    @Put("editInfo/admin/:id")
    async adminEditUserInfo(
        @Param("id") id : string ,
        @Body() dto : AdminEditUserInfoDto
    ){
        return this.userService.adminEditUserInfo(id, dto)
    }

    @Get("getUser/:id")
    async  getUserById(@Param("id") id : string){
        return this.userService.getUserById(id)
    }


    @Get("verify-email")
    async verifyEmailUpdate(@Query("token") token : string , @Res() res : Response){
        try{
            const redirectUrl = await this.userService.verifyEmailUpdate(token)
            return res.redirect(redirectUrl)
        }catch(err){
            console.error('Verification error:', err.message);
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ success: false, message: err.message || 'Invalid or expired token' });
            }
    }

    @Delete(":userId")
    async deleteUser(@Param("userId") userId : string){
        return this.userService.deleteUser(userId)
    }

}
