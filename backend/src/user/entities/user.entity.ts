import { ComplaintEntity } from "src/complaint/entities/complaint.entity";
import { GroupEntity } from "src/groups/entities/group.entity";
import { LogsEntity } from "src/logs/entities/logs.entity";
import { RolesEntity } from "src/roles/entities/roles.entity";
import { Column, CreateDateColumn, Entity, ForeignKey, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, Unique } from "typeorm";


@Entity("user_info")
export class UserEntity{

    @PrimaryGeneratedColumn()
    user_id : number ;

    @Column()
    user_name :string ;

    @Column() 
    user_email : string ;

    @ManyToOne(() => RolesEntity, (role) => role.users, { eager: true }) 
    @JoinColumn({ name: "user_role_id" })  // This will be the FK column name in DB
    user_role: RolesEntity;

    @Column()
    user_password : string ;

    @Column()
    profilePicture : string 

    @CreateDateColumn({type : "timestamp"})
    created_at : Timestamp


    @ManyToMany(()=> GroupEntity ,  group => group.users , {cascade : true})
    @JoinTable({
        name : 'group_user' ,
        joinColumn:{
            name : "user_id",
            referencedColumnName:"user_id"
        },
        inverseJoinColumn:{
            name : "group_id" ,
            referencedColumnName:"group_id"
        }
    })
    groups : GroupEntity[]


    @OneToMany(()=> ComplaintEntity , complaint => complaint.creator_user)
    complaints : ComplaintEntity[]

    @OneToMany(() => LogsEntity , (log) => log.user)
    logs : LogsEntity[]

}