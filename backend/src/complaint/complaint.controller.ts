import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { AddComplaintDto } from './dtos/add-complaint.dto';
import { HandleComplaintInGroupDto } from './dtos/handle-complaint-in-group.dto';
import { ChangeComplaintStatusDto } from './dtos/change-complaint-status.dto';
import { ListComplaintsDto } from './dtos/list-complaints.dto';
import { DeleteComplaintDto } from './dtos/delete-complaint.dto';
import { CheckTokenGaurd } from 'src/gaurds/check-token-gaurd.gaurd';
import { CheckPermissionGaurd, Permission } from 'src/gaurds/check-permission.gaurd';

@Controller('complaints')
export class ComplaintController {

    constructor(private readonly complaintService : ComplaintService){}

    @Post(":id")
    @UseGuards(CheckTokenGaurd)
    // @Permission("add_complaint")
    async addComplaint(@Param("id") id : string , @Body() addComplaintDto : AddComplaintDto){
        const idNum = Number(id)
        return this.complaintService.addComplaint(addComplaintDto , idNum)
    }

    @Post('handleComplaintInGroup/:id')
    @UseGuards(CheckTokenGaurd)
    async handleComplaintInGroup(@Param("id") id : string , @Body() handleComplaintInGroupDto : HandleComplaintInGroupDto){
        
        return this.complaintService.handleComplaintInGroup(id , handleComplaintInGroupDto)
    }

    @Put()
    @UseGuards(CheckTokenGaurd,CheckPermissionGaurd)
    @Permission("edit_complaint")
    async changeComplaintStatus(@Body() dto : ChangeComplaintStatusDto){
        return this.complaintService.changeComplaintStatus(dto)
    }

    @Post()
    @UseGuards(CheckTokenGaurd,CheckPermissionGaurd)
    @Permission("view_complaints")
    async listComplaints(@Body() dto : ListComplaintsDto){
        return this.complaintService.listComplaints(dto);
    }

    @Get("info/:id")
    @UseGuards(CheckTokenGaurd)
    async getComplaintInfo(@Param("id") id : string){
        return this.complaintService.getComplaintInfo(id)
    }

    @Get("user/:id")
    @UseGuards(CheckTokenGaurd)
    async listUserComplaints(@Param("id") id : string){
        return this.complaintService.listUsrComplaints(id)
    }

    @Delete("delete/:userId")
    @UseGuards(CheckTokenGaurd,CheckPermissionGaurd)
    @Permission("delete_complaint")
    async deleteComplaint(@Param("userId") userId : string , @Body() dto : DeleteComplaintDto){
        console.log("testing")
        return this.complaintService.deleteComplaint(userId , dto.complaintId)
    }

}
