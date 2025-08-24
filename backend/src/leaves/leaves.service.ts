import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeavesEntity, LeaveStatus, LeaveType } from './entities/leaves.entity';
import { ILike, Repository } from 'typeorm';
import { AddLeaveDto } from './dtos/add-leave.dto';
import { UserEntity } from '../user/entities/user.entity';
import { ChangeLeaveStateDto } from './dtos/change-leave-state.dto';
import { GroupEntity } from '../groups/entities/group.entity';
import { PagingDto } from './dtos/paging.dto';
import { format } from 'date-fns'; // for date formatting
import { GetUserLeavesDto, LeaveItemDto } from './dtos/get-user-leaves.dto';


@Injectable()
export class LeavesService {


    constructor(
        @InjectRepository(LeavesEntity) private readonly leavesRepo : Repository<LeavesEntity>,
        @InjectRepository(UserEntity) private readonly userRepo : Repository<UserEntity> ,
        @InjectRepository(GroupEntity) private readonly groupRepo : Repository<GroupEntity>
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

    async changeLeaveState(leave_id : string ,  dto : ChangeLeaveStateDto){
        const{new_state , leave_handler_id}  = dto;

        if(isNaN(Number(leave_id)) || isNaN(Number(leave_handler_id))){
            throw new BadRequestException("invalid id format")
        }
        const leave = await this.leavesRepo.findOne(
            {
                where : {leave_id : Number(leave_id)},
                relations  :['leave_user'],
                select : {
                    leave_description : true ,
                    leave_id : true ,
                    leave_type : true ,
                    leave_status : true ,
                    leave_user : {
                        user_id : true ,
                        user_password:false ,
                        user_name : true
                    }
                }
            }
        )

        if(!leave){
           throw new NotFoundException("leave not found ") 
        }
        const leaveHandler = await this.userRepo.findOne(
            {
                where : {user_id : Number(leave_handler_id)} , 
                select :{
                    user_id : true ,
                    user_password:false ,
                    user_name : true
                }
            }
        )
        if(!leaveHandler){
            throw new NotFoundException("user not found")
        }

        if (!Object.values(LeaveStatus).includes(new_state as LeaveStatus)) {
            throw new BadRequestException('Invalid leave status');
        }


        leave.leave_status  = new_state as LeaveStatus ;
        leave.leave_handler = leaveHandler;
        await this.leavesRepo.save(leave)

        return {
            success : true, 
            message : "leave state updated successfully",
            leave
        }
    }

    async getLeave(leave_id : string){
        if(isNaN(Number(leave_id))){
            throw new BadRequestException("leave is is invalid")
        }
        const leave = await this.leavesRepo.findOne(
            {
                where : {leave_id : Number(leave_id)},
                relations : ["leave_user" , 'leave_handler'],
                select : {
                    leave_description : true,
                    leave_handler : {
                        user_email : true ,
                        user_name : true ,
                        user_password : false ,
                        user_id : true
                    },
                    leave_user : {
                        user_id : true ,
                        user_name : true , 
                        user_email : true , 
                        user_password : false
                    },
                    leave_type : true ,
                    leave_status : true
                }
            }
        )
        if(!leave){
            throw new NotFoundException("leave not found")
        }
        return {
            success : true ,
            leave : leave
        }
    }
    
    async deleteLeave(leave_id : string , user_id : string){
        if(isNaN(Number(leave_id)) || isNaN(Number(user_id))){
            throw new BadRequestException("invalid ids format")
        }

        const leave = await this.leavesRepo.findOne(
            {
                where : {leave_id  : Number(leave_id)},
                relations:["leave_user"],
                select : {
                    leave_description: true ,
                    leave_id : true ,
                    leave_user : {
                        user_id : true,
                        user_password : false
                    }
                }
            }
        )
        if(!leave){
            throw new NotFoundException("leave not found")
        }

        const user = await this.userRepo.findOne(
            {
                where : {user_id : Number(user_id)}
            }
        )

        if(!user){
            throw new NotFoundException("user not found")
        }

        if(leave.leave_user.user_id !== user.user_id){
            const hr_department = await this.groupRepo.findOne(
                {
                    where : {group_name : ILike("hr")},
                    relations : ["users"],
                    select : {
                        group_id : true ,
                        group_name : true ,
                        users : {
                            user_id : true ,
                            user_password : false
                        }
                    }
                }
            )
            if(!hr_department){
                throw new NotFoundException("not hr group found to delete the request")
            }
            const is_member = hr_department.users.some( u => u.user_id === Number(user_id))
            if(!is_member){
                throw new ForbiddenException("the user must be the owner or in the HR group to delete the leave")
            }
            await this.leavesRepo.delete(leave.leave_id)
            return {
                success : true ,
                message : "the leave has been deleted successfully by HR group"
            }
        }

        await this.leavesRepo.delete(leave.leave_id)
        return {
            success : true ,
            message : "the leave has been deleted successfully by its own user"
        }
    }



    async getUserLeaves(userId: string, dto: PagingDto): Promise<GetUserLeavesDto> {
        const { currentPage, leavesPerPage } = dto;

        if (isNaN(Number(userId))) {
            throw new BadRequestException('user id is invalid');
        }

        if (
            isNaN(Number(currentPage)) ||
            isNaN(Number(leavesPerPage)) ||
            Number(leavesPerPage) <= 0 ||
            Number(currentPage) <= 0
        ) {
            throw new BadRequestException('error in the input page');
        }

        const skip = (Number(currentPage) - 1) * Number(leavesPerPage);
        const take = Number(leavesPerPage);

        const user = await this.userRepo
            .createQueryBuilder('user_info')
            .leftJoinAndSelect('user_info.own_leaves', 'leave_info')
            .leftJoinAndSelect('leave_info.leave_user', 'leave_user') // join user who created the leave
            .leftJoinAndSelect('leave_info.leave_handler', 'leave_handler') // join handler user
            .where('user_info.user_id = :userId', { userId: Number(userId) })
            .orderBy('leave_info.created_at', 'DESC')
            .skip(skip)
            .take(take)
            .getOne();

        if (!user) {
            throw new NotFoundException('user not found');
        }

        const totalLeaves = await this.leavesRepo.count({
            where: { leave_user: { user_id: Number(userId) } },
        });

        const leaves: LeaveItemDto[] = (user.own_leaves || []).map((leave) => ({
            leave_id: leave.leave_id,
            leave_description: leave.leave_description,
            leave_status: leave.leave_status,
            leave_type: leave.leave_type,
            created_at: format(new Date(leave.created_at), 'yyyy-MM-dd HH:mm'),
            updated_at: format(new Date(leave.updated_at), 'yyyy-MM-dd HH:mm'),
            leave_user_name: leave.leave_user?.user_name || '',
            leave_handler_name: leave.leave_handler?.user_name || '',
        }));

        
        return {
           

            user_id: user.user_id,
            user_name: user.user_name,
            leaves,
            currentPage: Number(currentPage),
            leavesPerPage: take,
            totalLeaves,
        };
        }

}
