import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PermissionEntity } from "./permission.entity";
import { UserEntity } from "../../user/entities/user.entity";


@Entity("role_info")
export class RolesEntity{
    @PrimaryGeneratedColumn()
    role_id : number 

    @Column()
    role_name : string;

    @ManyToMany(() => PermissionEntity, permission => permission.roles , { cascade : true})
    @JoinTable()
    permissions: PermissionEntity[];

    @OneToMany(() => UserEntity, user => user.user_role)
    users: UserEntity[];
}