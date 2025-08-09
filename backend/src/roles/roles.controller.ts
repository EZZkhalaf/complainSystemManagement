import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreatePermissionDto } from './dtos/create-permissions.dto';
import { AddPermissionsToRoleDto } from './dtos/add-permissions-to-role.dto';
import { CreateRoleDto } from './dtos/create-role.dto';

@Controller('role')
export class RolesController {

    constructor(private readonly rolesService : RolesService){}


    @Post()
    async addNewRole(@Body() body : CreateRoleDto , @Req() req : any){
        return this.rolesService.addNewRole(req, body.newRole)
    }

    @Get()
    async getRoles(){
        return this.rolesService.getRoles()
    }

    @Post("addPermissions")
    async addPermissions(@Body() dto : CreatePermissionDto){
        return this.rolesService.addPermissions(dto.permissions)
    }

    @Delete("deletePermission/:id")
    async deletePermission(@Param("id") id : string){
        return this.rolesService.deletePermission(id)
    }

    @Get("getPermissions")
    async getPermissions(){
        return this.rolesService.getPermissions()
    }

    @Post("addPermissionsToRole")
    async addPermissionsToRole(@Body() dto : AddPermissionsToRoleDto){
        return this.rolesService.addPermissionsToRole(dto)
    }

    @Get(":id")
    async getRoleById(@Param("id") id : string){
        return this.rolesService.getRoleById(id)
    }

    @Delete(":roleId")
    async deleteRole(@Param("roleId") roleId : string){
        return this.rolesService.deleteRole(roleId)
    }
}
