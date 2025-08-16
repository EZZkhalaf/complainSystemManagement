import { Column, CreateDateColumn, Entity, ForeignKey, JoinColumn, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RolesEntity } from "./roles.entity";


@Entity("permission_info")
export class PermissionEntity{

    @PrimaryGeneratedColumn()
    permission_id : number;

    @Column()
    permission_name : string ;

    @Column()
    permission_description :  string ;

    @CreateDateColumn({type : 'timestamp'})
    created_at : Date

    @ManyToMany(() => RolesEntity , role => role.permissions )
    roles : RolesEntity[]

}