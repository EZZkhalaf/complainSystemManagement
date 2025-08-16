import { GroupEntity } from "src/groups/entities/group.entity";
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable } from "typeorm";

@Entity("complaint_groups_rule")
export class ComplaintGroupsRuleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => GroupEntity)
  @JoinTable({
    name: "complaint_groups_rule_groups", // junction table
    joinColumn: { name: "rule_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "group_id", referencedColumnName: "group_id" },
  })
  groups: GroupEntity[];

  @CreateDateColumn()
  created_at: Date;
}
