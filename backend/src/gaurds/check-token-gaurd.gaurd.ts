import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { permission } from "process";
import { NotFoundError, Observable } from "rxjs";
import { Role, RoleDocument } from "src/roles/schemas/role.schema";
import { User, UserDocument } from "src/user/schemas/user.schema";

@Injectable()
export class CheckTokenGaurd implements CanActivate{
    constructor(
        private jwtService : JwtService,
        @InjectModel(User.name) private userModel : Model<UserDocument>,
        @InjectModel(Role.name) private roleModel : Model<RoleDocument>
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const authHeader = req.headers.authorization;
        if(!authHeader)
            throw new UnauthorizedException("no token provided ")

        const token = authHeader.split(" ")[1];
        if(!token)
            throw new UnauthorizedException("invalid token")

        try {
            const decoded = await this.jwtService.verify(token , {
                secret : process?.env?.JWT_SECRET
            })

            const user = await this.userModel.findById(decoded._id).select("-password")
            if(!user)
                throw new NotFoundException("user not found")

            const role = await this.roleModel.findOne({user : user._id}).select("-user").populate("permissions")

            req.user = {
                ...user.toObject(),
                permissions : role?.permissions || [],
                role : role?.role || "user"
            }
            console.log(req.user)
            return true
        }catch (err) {
           throw new UnauthorizedException('Token is invalid or expired');
        }
    }
}