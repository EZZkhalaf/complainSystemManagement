import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { AddComplaintDto } from './dtos/add-complaint.dto';
import { HandleComplaintInGroupDto } from './dtos/handle-complaint-in-group.dto';
import { ChangeComplaintStatusDto } from './dtos/change-complaint-status.dto';
import { ListComplaintsDto } from './dtos/list-complaints.dto';

@Controller('complaints')
export class ComplaintController {

    constructor(private readonly complaintService : ComplaintService){}

    @Post(":id")
    async addComplaint(@Param("id") id : string , @Body() addComplaintDto : AddComplaintDto){
        return this.complaintService.addComplaint(addComplaintDto , id)
    }

    @Post('handleComplaintInGroup/:id')
    async handleComplaintInGroup(@Param("id") id : string , @Body() handleComplaintInGroupDto : HandleComplaintInGroupDto){
        return this.complaintService.handleComplaintInGroup(id , handleComplaintInGroupDto)
    }

    @Put()
    async changeComplaintStatus(@Body() dto : ChangeComplaintStatusDto){
        return this.complaintService.changeComplaintStatus(dto)
    }

    @Get(":id")
    async listComplaints(@Param("id") dto : ListComplaintsDto){
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
    async deleteComplaint(@Param("userId") userId : string , @Body() complaintId : string){
        return this.complaintService.deleteComplaint(userId , complaintId)
    }

}
