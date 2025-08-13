import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreatePermissionDto } from './dtos/create-permissions.dto';
import { AddPermissionsToRoleDto } from './dtos/add-permissions-to-role.dto';
import { CreateRoleDto } from './dtos/create-role.dto';
import { CheckTokenGaurd } from 'src/gaurds/check-token-gaurd.gaurd';
import { CheckPermissionGaurd, Permission } from 'src/gaurds/check-permission.gaurd';
import { PermissionEntity } from './entities/permission.entity';

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
    @UseGuards(CheckTokenGaurd)
    async getRoles(){
        return this.rolesService.getRoles()
    }

    @Post("addPermissions")
    @UseGuards(CheckTokenGaurd,CheckPermissionGaurd)
    @Permission("manage_permissions")
    async addPermissions(@Body() dto : CreatePermissionDto , @Req() req : any){
        return this.rolesService.addPermissions(req.user , dto)
    }

    @Delete("deletePermission/:id")
    @UseGuards(CheckTokenGaurd,CheckPermissionGaurd)
    @Permission("manage_permissions")
    async deletePermission(@Param("id") id : string , @Req() req : any){
        return this.rolesService.deletePermission( req.user , id)
    }

    @Get("getPermissions")
    @UseGuards(CheckTokenGaurd,CheckPermissionGaurd)
    @Permission("manage_permissions")
    async getPermissions(){
        return this.rolesService.getPermissions()
    }

    @Post("addPermissionsToRole")
    @UseGuards(CheckTokenGaurd,CheckPermissionGaurd)
    @Permission("manage_permissions")
    async addPermissionsToRole(@Body() dto : AddPermissionsToRoleDto){
        return this.rolesService.addPermissionsToRole(dto)
    }

    @Get(":id")
    @UseGuards(CheckTokenGaurd)
    async getRoleById(@Param("id") id : string){
        return this.rolesService.getRoleById(id)
    }

    @Delete(":roleId")
    @UseGuards(CheckTokenGaurd,CheckPermissionGaurd)
    @Permission("manage_permissions")
    async deleteRole(@Param("roleId") roleId : string){
        return this.rolesService.deleteRole(roleId)
    }





    @Post("testingnewRole")
    async createRole(@Body() body : {roleName : string , permissionIds : []}){
        return this.rolesService.createRoleWithPermissions(body.roleName , body.permissionIds)
    }
    
}
