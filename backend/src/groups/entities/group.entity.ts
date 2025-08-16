import { ComplaintGroupsRuleEntity } from "src/complaint/entities/complaint-groups-rule.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity()
export class GroupEntity {
    @PrimaryGeneratedColumn()
    group_id: number;

    @Column() 
    group_name: string;
    
    @CreateDateColumn({ type: "timestamp" })
    created_at: Timestamp;

    @ManyToMany(() => UserEntity, user => user.groups)
    users: UserEntity[];

    @ManyToMany(() => ComplaintGroupsRuleEntity, rule => rule.groups)
    complaintGroupsRules: ComplaintGroupsRuleEntity[]; // <-- No @JoinTable here
}
