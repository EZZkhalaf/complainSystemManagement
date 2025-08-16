import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Model } from "mongoose";
import { Repository } from "typeorm";
import { PermissionEntity } from "./entities/permission.entity";



@Injectable()
export class PermissionRepository{
    constructor(
        @InjectRepository(PermissionEntity) private readonly permissionRepo : Repository<PermissionEntity>
    ){}

    async createPermission(permission_name : string , permission_description: string){
        const result = await this.permissionRepo.query( 
            `
            INSERT INTO permission_info(permission_name , permission_description , created_at)
            VALUES ($1 , $2 , NOW())
            RETURNING * 
            ` ,
            [permission_name , permission_description]
        )
        return result[0]
    }

   
}