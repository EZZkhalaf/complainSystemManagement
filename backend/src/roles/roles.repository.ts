import { InjectRepository } from "@nestjs/typeorm";
import { RolesEntity } from "./entities/roles.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { PermissionEntity } from "./entities/permission.entity";


@Injectable()
export class RoleRepository {
    constructor(
        @InjectRepository(RolesEntity)
        private readonly roleRepo : Repository<RolesEntity>
    ){}

    create(role_name : string){
        const role = this.roleRepo.create({role_name : role_name})
        return this.roleRepo.save(role)
    }


    findAllRoles(){
        return this.roleRepo.find()
    }
}