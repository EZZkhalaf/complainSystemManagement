import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { UserIdParameterDto } from './dtos/user-id-parameter.dto';
import { CreateGroupDto } from './dtos/create-group.dto';
import { RemoveUserFromGroupDto } from './dtos/remove-user-from-group.dto';
import { ListGroupComplaintsDto } from './dtos/list-group-complaints.dto';
import { SearchGroupDto } from './dtos/search-group.dto';
import { AddGroupToRuleDto } from './dtos/add-group-to-rule.dto';
import { CheckTokenGaurd } from '../gaurds/check-token-gaurd.gaurd';
import { CheckPermissionGaurd, Permission } from '../gaurds/check-permission.gaurd';

@Controller('group')
export class GroupsController {

    constructor(private readonly groupsService : GroupsService){}

    @Post(":userId")
    @UseGuards(CheckTokenGaurd , CheckPermissionGaurd)
    @Permission("add_group")
    async createGroup(@Param("userId") userId : string , @Body() dto : CreateGroupDto){
        return this.groupsService.createGroup(userId , dto)
    }

    @Delete("removeUser")
    @UseGuards(CheckTokenGaurd , CheckPermissionGaurd)
    @Permission("remove_employee_from_group")
    async removeUserFromGroup(@Body() dto : RemoveUserFromGroupDto){
        return this.groupsService.removeUserFomeGroup(dto)
    }

    @Delete(":groupId")
    @UseGuards(CheckTokenGaurd , CheckPermissionGaurd)
    @Permission("delete_group")
    async deleteGroup(@Param("groupId") groupId: string, @Req() req : any){
       
        return this.groupsService.deleteGroup(req.user , groupId)
    }

    @Get(":groupId")
        async getGroupInfoAndUsers(@Param("groupId") groupId : string){
        return this.groupsService.getGroupInfoAndUsers(groupId)
    }

    @Get("user/:id")
        async getUsersGroups(@Param("id") id : string){
        return this.groupsService.getUserGroups(id)
    }

    @Get("admin/:id")
        async listGroups(@Param("id") id : string){
        return this.groupsService.listGroups(id)
    }

    @Post("groupcomplaints/:id")
        async listGroupComplaints(@Param("id") id : string ,@Body() dto : ListGroupComplaintsDto){
        return this.groupsService.listGroupComplaints(id , dto)
    }

    @Post("searchGroups/:id")
        async searchGroups(@Param("id") id : string ,@Body() dto : SearchGroupDto ){
        return this.groupsService.searchGroups(dto.search)
    }

    @Post("addGroupToRule/:id")
    @UseGuards(CheckTokenGaurd , CheckPermissionGaurd)
    @Permission("add group to rule")
    async addGroupToRule(@Param("id") id : string , @Body() groupId : AddGroupToRuleDto){
        return this.groupsService.addGroupToRule(id , groupId.groupId)
    }

    @Delete("removeGroupFromRule/:id")
    @UseGuards(CheckTokenGaurd , CheckPermissionGaurd)
    @Permission("remove group from rule")
    async removeGroupFromRule(@Param("id") id : string , @Body() groupId: AddGroupToRuleDto){
        return this.groupsService.removeGroupFromRule(id , groupId.groupId)
    }

    @Get("getRules/:id")
        async getRules(@Param("id") id : string){
        return this.groupsService.getRules()
    }
}
