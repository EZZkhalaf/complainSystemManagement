import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { AddComplaintDto } from './dtos/add-complaint.dto';
import { HandleComplaintInGroupDto } from './dtos/handle-complaint-in-group.dto';
import { ChangeComplaintStatusDto } from './dtos/change-complaint-status.dto';
import { ListComplaintsDto } from './dtos/list-complaints.dto';
import { DeleteComplaintDto } from './dtos/delete-complaint.dto';
import { CheckTokenGaurd } from '../gaurds/check-token-gaurd.gaurd';
import { CheckPermissionGaurd, Permission } from '../gaurds/check-permission.gaurd';

@Controller('complaints')
export class ComplaintController {

    constructor(private readonly complaintService : ComplaintService){}

    @Post(":id")
        // @Permission("add_complaint")
    async addComplaint(@Param("id") id : string , @Body() addComplaintDto : AddComplaintDto){
        const idNum = Number(id)
        return this.complaintService.addComplaint(addComplaintDto , idNum)
    }

    @Post('handleComplaintInGroup/:id')
        async handleComplaintInGroup(@Param("id") id : string , @Body() handleComplaintInGroupDto : HandleComplaintInGroupDto){
        
        return this.complaintService.handleComplaintInGroup(id , handleComplaintInGroupDto)
    }

    @Put()
    @UseGuards(CheckPermissionGaurd)
    @Permission("edit_complaint")
    async changeComplaintStatus(@Body() dto : ChangeComplaintStatusDto){
        return this.complaintService.changeComplaintStatus(dto)
    }

    @Post()
    @UseGuards(CheckPermissionGaurd)
    @Permission("view_complaints")
    async listComplaints(@Body() dto : ListComplaintsDto){
        return this.complaintService.listComplaints(dto);
    }

    @Get("info/:id")
        async getComplaintInfo(@Param("id") id : string){
        return this.complaintService.getComplaintInfo(id)
    }

    @Get("user/:id")
        async listUserComplaints(@Param("id") id : string){
        return this.complaintService.listUsrComplaints(id)
    }

    @Delete("delete/:userId")
    @UseGuards(CheckPermissionGaurd)
    @Permission("delete_complaint")
    async deleteComplaint(@Param("userId") userId : string , @Body() dto : DeleteComplaintDto){
        console.log("testing")
        return this.complaintService.deleteComplaint(userId , dto.complaintId)
    }

}
