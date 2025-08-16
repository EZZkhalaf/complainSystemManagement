import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { InjectRepository } from "@nestjs/typeorm";
import { Model } from "mongoose";
import { permission } from "process";
import { NotFoundError, Observable } from "rxjs";
import { RolesEntity } from "src/roles/entities/roles.entity";
import { Role, RoleDocument } from "src/roles/schemas/role.schema";
import { UserEntity } from "src/user/entities/user.entity";
import { User, UserDocument } from "src/user/schemas/user.schema";
import { Repository } from "typeorm";

@Injectable()
export class CheckTokenGaurd implements CanActivate{
    constructor(
        private jwtService : JwtService,
        @InjectModel(User.name) private userModel : Model<UserDocument>,
        @InjectModel(Role.name) private roleModel : Model<RoleDocument>,


        @InjectRepository(UserEntity) private userRepo : Repository<UserEntity>,
        @InjectRepository(RolesEntity) private rolesRepo : Repository<RolesEntity>
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const token = req.cookies?.access_token;
        if(!token)
            throw new UnauthorizedException("invalid token")

        try {
            const decoded = await this.jwtService.verify(token , {
                secret : process?.env?.JWT_SECRET
            })

            const user = await this.userRepo.findOne({ where :{user_id : decoded._id}})
            if(!user)
                throw new NotFoundException("user not found")

            const role = await this.rolesRepo.findOne({ 
                where : { users : {user_id : user.user_id}},
                relations : ['permissions']
            })
                

            req.user = {
                ...user,
                permissions : role?.permissions || [],
                role : role?.role_name || "user"
            }
            return true
        }catch (err) {
           throw new UnauthorizedException('Token is invalid or expired');
        }
    }
}