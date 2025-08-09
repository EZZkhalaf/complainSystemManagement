import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { UserIdParameterDto } from './dtos/user-id-parameter.dto';
import { CreateGroupDto } from './dtos/create-group.dto';
import { RemoveUserFromGroupDto } from './dtos/remove-user-from-group.dto';
import { ListGroupComplaintsDto } from './dtos/list-group-complaints.dto';

@Controller('group')
export class GroupsController {

    constructor(private readonly groupsService : GroupsService){}

    @Post(":userId")
    async createGroup(@Param("userId") userId : UserIdParameterDto , @Body() dto : CreateGroupDto){
        return this.groupsService.createGroup(userId.userId , dto)
    }

    @Delete("removeUser")
    async removeUserFromGroup(@Body() dto : RemoveUserFromGroupDto){
        return this.groupsService.removeUserFomeGroup(dto)
    }

    @Delete(":groupId")
    async deleteGroup(@Param("groupId") groupId: string, @Req() req){
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
    async searchGroups(@Param("id") id : string ,@Body() search : string ){
        return this.groupsService.searchGroups(search)
    }

    @Post("addGroupToRule/:id")
    async addGroupToRule(@Param("id") id : string , @Body() groupId : string){
        return this.groupsService.addGroupToRule(id , groupId)
    }

    @Delete("removeGroupFromRule/:id")
    async removeGroupFromRule(@Param("id") id : string , @Body() groupId: string){
        return this.groupsService.removeGroupFromRule(id , groupId)
    }
}
