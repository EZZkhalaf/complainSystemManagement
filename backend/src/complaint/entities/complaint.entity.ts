import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { UserEntity } from "src/user/entities/user.entity";
export enum ComplaintStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  RESOLVED = "resolved",
  REJECTED = "rejected",
}

export enum ComplaintType {
  GENERAL = "general",
  TECHNICAL = "technical",
  BILLING = "billing",
  OTHER = "other",
}


@Entity("complaint_info")
export class ComplaintEntity {
  @PrimaryGeneratedColumn()
  complaint_id: number;

  // Define ManyToOne relation to UserEntity for creator_user
  @ManyToOne(() => UserEntity, user => user.complaints, { eager: true })
  creator_user: UserEntity;

  @Column()
  description: string;

  @Column({
    type: "enum",
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDING,
  })
  complaint_status: ComplaintStatus;

  @Column({
    type: "enum",
    enum: ComplaintType,
    default : ComplaintType.GENERAL
  })
  complaint_type: ComplaintType;
}
