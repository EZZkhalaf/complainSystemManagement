import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepo : Repository<UserEntity>,

    ){}


    async findUserByEmail(email: string) {
        return this.userRepo.findOne({ where: { user_email : email } });
    }
}