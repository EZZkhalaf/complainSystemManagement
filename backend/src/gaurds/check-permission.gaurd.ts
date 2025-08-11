import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { permission } from "process";
import { Observable } from "rxjs";
import { Role } from "src/roles/schemas/role.schema";
import { User, UserDocument } from "src/user/schemas/user.schema";


export const PERMISSION_KEY = 'permission';
export const Permission = (permissionName : string) => SetMetadata(PERMISSION_KEY , permissionName)

@Injectable()
export class CheckPermissionGaurd implements CanActivate {

    constructor(
        private reflector : Reflector
    ){}

    canActivate(context: ExecutionContext): boolean {
        const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY , [
            context.getHandler() ,
            context.getClass()
        ])

        if(!requiredPermission)
            return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if(!user)
            throw new UnauthorizedException("user not found or provided")

        const hasPermission = user.permissions?.some( (p : any) => p.name === requiredPermission)
        if(!hasPermission)
            throw new ForbiddenException("permission denied ")

        return true
    }   
}