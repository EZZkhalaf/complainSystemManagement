import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeavesEntity, LeaveStatus, LeaveType } from './entities/leaves.entity';
import { Repository } from 'typeorm';
import { AddLeaveDto } from './dtos/add-leave.dto';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class LeavesService {


    constructor(
        @InjectRepository(LeavesEntity) private readonly leavesRepo : Repository<LeavesEntity>,
        @InjectRepository(UserEntity) private readonly userRepo : Repository<UserEntity>
    ){}


    async createLeave(id : string , dto : AddLeaveDto){
        const {leave_description  , leave_type} = dto

        if (!leave_description || leave_description.trim() === '') {
            throw new BadRequestException("Leave description cannot be empty");
        }

        if (!Object.values(LeaveType).includes(leave_type as LeaveType)) {
            throw new BadRequestException("Invalid leave type");
        }

       
        const user = await this.userRepo.findOne({
            where : {user_id : Number(id)}
        })
        if(!user){
            throw new NotFoundException("user not found")
        }

        const newLeave = this.leavesRepo.create({
            leave_description,
            leave_type,
            leave_user: user
        });

        await this.leavesRepo.save(newLeave)

        return {
            success : true , 
            message : "leave created successfully"
        }
    }
}
