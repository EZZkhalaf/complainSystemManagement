import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreatePermissionDto } from './dtos/create-permissions.dto';
import { AddPermissionsToRoleDto } from './dtos/add-permissions-to-role.dto';
import { CreateRoleDto } from './dtos/create-role.dto';
import { CheckTokenGaurd } from '../gaurds/check-token-gaurd.gaurd';
import { CheckPermissionGaurd, Permission } from '../gaurds/check-permission.gaurd';

@Controller('role')
export class RolesController {

    constructor(private readonly rolesService : RolesService){}


    @Post()
    @UseGuards(CheckTokenGaurd ,CheckPermissionGaurd)
    @Permission("manage_permissions")
    async addNewRole(@Body() body : CreateRoleDto , @Req() req : any){
        return this.rolesService.addNewRole(req, body.newRole)
    }

    @Get()
        async getRoles(){
        return this.rolesService.getRoles()
    }

    @Post("addPermissions")
    @UseGuards(CheckPermissionGaurd)
    @Permission("manage_permissions")
    async addPermissions(@Body() dto : CreatePermissionDto[] , @Req() req : any){
        return this.rolesService.addPermissions(req.user , dto)
    }

    @Delete("deletePermission/:id")
    @UseGuards(CheckPermissionGaurd)
    @Permission("manage_permissions")
    async deletePermission(@Param("id") id : string , @Req() req : any){
        return this.rolesService.deletePermission( req.user , id)
    }

    @Get("getPermissions")
    @UseGuards(CheckPermissionGaurd)
    @Permission("manage_permissions")
    async getPermissions(){
        return this.rolesService.getPermissions()
    }

    @Post("addPermissionsToRole")
    @UseGuards(CheckPermissionGaurd)
    @Permission("manage_permissions")
    async addPermissionsToRole(@Body() dto : AddPermissionsToRoleDto , @Req() req : any){
        return this.rolesService.addPermissionsToRole(dto , req)
    }

    @Get(":id")
        async getRoleById(@Param("id") id : string){
        return this.rolesService.getRoleById(id)
    }

    @Delete(":roleId")
    @UseGuards(CheckPermissionGaurd)
    @Permission("manage_permissions")
    async deleteRole(@Param("roleId") roleId : string , @Req() req : any){
        return this.rolesService.deleteRole(roleId , req)
    }





    @Post("testingnewRole")
    async createRole(@Body() body : {roleName : string , permissionIds : []}){
        return this.rolesService.createRoleWithPermissions(body.roleName , body.permissionIds)
    }
    
}
