import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { AddLeaveDto } from './dtos/add-leave.dto';
import { CheckTokenGaurd } from '../gaurds/check-token-gaurd.gaurd';
import { ChangeLeaveStateDto } from './dtos/change-leave-state.dto';
import { userInfo } from 'os';
import { PagingDto } from './dtos/paging.dto';
import { PaginAndFilterDto } from './dtos/paging-and-filter.dto';
import {
  CheckPermissionGaurd,
  Permission,
} from '../gaurds/check-permission.gaurd';

@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post('/:userId')
  async createLeave(@Param('userId') userId: string, @Body() dto: AddLeaveDto) {
    return this.leavesService.createLeave(userId, dto);
  }

  @Put('changeState/:leaveId')
  @UseGuards(CheckPermissionGaurd)
  @Permission('view-leaves')
  @Permission('handle-leaves')
  async changeLeaveState(
    @Param('leaveId') leaveId: string,
    @Body() dto: ChangeLeaveStateDto,
  ) {
    return this.leavesService.changeLeaveState(leaveId, dto);
  }

  @Get('/:leaveId')
  @UseGuards(CheckPermissionGaurd)
  @Permission('view-leaves')
  async getTokenById(@Param('leaveId') leaveId: string) {
    return this.leavesService.getLeave(leaveId);
  }
  @Delete('/:leaveId')
  async deleteLeave(@Param('leaveId') leaveId: string, @Body() userId: string) {
    return this.leavesService.deleteLeave(leaveId, userId);
  }

  @Post('/user/:userId')
  async getUSerLeaves(@Param('userId') userId: string, @Body() dto: PagingDto) {
    return this.leavesService.getUserLeaves(userId, dto);
  }

  @Post('/getOtherLeaves/:userId')
  async getLeaves(
    @Param('userId') userId: string,
    @Body() dto: PaginAndFilterDto,
  ) {
    return this.leavesService.getLeaves(dto);
  }
}
