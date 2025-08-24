import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { AddLeaveDto } from './dtos/add-leave.dto';
import { CheckTokenGaurd } from 'src/gaurds/check-token-gaurd.gaurd';
import { ChangeLeaveStateDto } from './dtos/change-leave-state.dto';

@Controller('leaves')
export class LeavesController {
    constructor(
        private readonly leavesService : LeavesService
    ){}

    @Post('/:userId')
    @UseGuards(CheckTokenGaurd)
    async createLeave(@Param('userId') userId : string , @Body() dto : AddLeaveDto){
        return this.leavesService.createLeave(userId , dto)
    }

    @Put('changeState/:leaveId')
    @UseGuards(CheckTokenGaurd)
    async changeLeaveState(@Param('leaveId') leaveId : string , @Body() dto : ChangeLeaveStateDto){
        return this.leavesService.changeLeaveState(leaveId , dto)
    }

    @Get("/:leaveId")
    @UseGuards(CheckTokenGaurd)
    async getTokenById(@Param("leaveId") leaveId : string){
        return this.leavesService.getLeave(leaveId)
    }
    @Delete("/:leaveId")
    @UseGuards(CheckTokenGaurd)
    async deleteLeave(@Param("leaveId") leaveId : string, @Body() userId : string){
        return this.leavesService.deleteLeave(leaveId , userId)
    }
}
