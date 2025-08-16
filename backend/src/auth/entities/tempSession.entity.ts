import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity("temp_sessions")
export class TempSessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", unique: true, nullable: false })
  email: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  token: string;

  @Column({ default: true })
  valid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "timestamptz", nullable: false })
  @Index() // index for expiration checks
  expiresAt: Date;
  
}
