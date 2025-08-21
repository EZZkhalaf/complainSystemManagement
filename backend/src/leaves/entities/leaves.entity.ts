import { IsNotEmpty } from "class-validator";
import { UserEntity } from "../../user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export enum LeaveStatus {
    PENDING  = 'pending' ,
    ACCEPTED = 'accepted' ,
    REJECTED = 'rejected'
}

export enum LeaveType{
    SICK = 'sick',
    GENERAL = 'general',
    PERSONAL = 'personal'
}
@Entity("leave_info")
export class LeavesEntity{
    @PrimaryGeneratedColumn()
    leave_id : number

    @Column()
    @IsNotEmpty()
    leave_description : string;

    @Column({
        type: 'enum',
        enum: LeaveType,
        default: LeaveType.GENERAL,
    })
    leave_type: LeaveType;

    @Column({
        type: 'enum',
        enum: LeaveStatus,
        default: LeaveStatus.PENDING,
    })
    leave_status: LeaveStatus;

    @ManyToOne(()=> UserEntity , (user)=> user.own_leaves , {eager : true , onDelete : "CASCADE"})
    leave_user : UserEntity

    @ManyToOne(()=> UserEntity , (user)=> user.handeled_leaves , {eager : true , onDelete : "CASCADE"})
    leave_handler : UserEntity


    @CreateDateColumn({type: 'timestamp' , default: () => 'CURRENT_TIMESTAMP',})
    created_at : Date ;

    @UpdateDateColumn({type : 'timestamp'})
    updated_at : Date;

}