import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { PermissionDto } from './dtos/permissions.dto';
import { AddPermissionsToRoleDto } from './dtos/add-permissions-to-role.dto';
import { NotFoundError } from 'rxjs';
import { LogsService } from 'src/logs/logs.service';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { CreatePermissionDto } from './dtos/create-permissions.dto';
import { RoleRepository } from './roles.repository';
import { RolesEntity } from './entities/roles.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionRepository } from './permission.repository';
// import { RolePaermissionEntity } from './entities/role-permission.entity';

@Injectable()
export class RolesService {
    constructor(
        private readonly logsService : LogsService,
        @InjectModel(Role.name) private roleModel : Model<RoleDocument> ,
        @InjectModel(Permission.name) private permissionModel : Model<PermissionDocument>,
        @InjectModel(User.name) private userModel : Model<UserDocument> ,



        @InjectRepository(RolesEntity) private readonly rolesRepo : Repository<RolesEntity>,
        @InjectRepository(PermissionEntity) private readonly permissionRepo1 : Repository<PermissionEntity>,
        private readonly permissionRepo : PermissionRepository ,
        // @InjectRepository(RolePaermissionEntity) private readonly rolePermissionRepo : Repository<RolePaermissionEntity>

    ){}


    async addNewRole(req : any ,newRole : string){
        if(newRole.length === 0)
            throw new BadRequestException("please fill the role name ")

        const existingRole = await this.roleModel.findOne({role : newRole})
        if(existingRole)
            throw new BadRequestException("role already exists")
        const createdRole = await this.roleModel.create({
            role : newRole
        })

        if(!createdRole)
            throw new InternalServerErrorException("error creating the role ")
        await createdRole.save()
        const createdRoleId = (createdRole._id as Types.ObjectId).toString()
        const user = req.user
        await this.logsService.logAction(user , "Add-Role" , "Role" , createdRoleId , `Has Created New Role : ${newRole}`)

        return {
            success : true ,
             message : "role created successfully" , 
             createdRole
        }
    }

    async getRoles(){
        const roles = await this.roleModel.find().populate("permissions")
        return {success : true , roles}
    }

    async addPermissions(
        user : any,
        permissions: CreatePermissionDto,
        ) {
            try{
                if (!Array.isArray(permissions)) {
                    throw new BadRequestException('The permissions must be an array');
                }

                const invalidPermissions = permissions.some(
                    (p) =>
                    typeof p !== 'object' ||
                    !p.name ||
                    !p.description ||
                    typeof p.name !== 'string' ||
                    typeof p.description !== 'string',
                );

                if (invalidPermissions) {
                    throw new BadRequestException(
                        "Each permission must be an object with 'name' and 'description' as strings",
                    );
                }

                const uniquePermissions = [
                    ...new Map(permissions.map((p) => [p.name, p])).values(),
                ];

                const existing = await this.permissionModel
                    .find({ name: { $in: uniquePermissions.map((p) => p.name) } })
                    .select('name');

                const existingNames = new Set(existing.map((p) => p.name));
                const newPermissions = uniquePermissions.filter(
                    (p) => !existingNames.has(p.name),
                );

                if (newPermissions.length === 0) {
                    return {
                    success: true,
                    message: 'No new permissions to add (all already exist)',
                    };
                }

                const inserted = await this.permissionModel.insertMany(newPermissions);

                await this.logsService.logAction(user, 'Add-Permission', 'Permission', user._id, `Added permissions: [${newPermissions.map(p => p.name).join(', ')}]`);

                return {
                    success: true,
                    message: 'New permissions added successfully',
                    data: inserted,
                };
            }catch(err){
                console.log(err)
                throw new InternalServerErrorException("internal server error ")
            }
    }


    async deletePermission(user : any ,  id : string){
        if(!isValidObjectId(id)){
            throw new BadRequestException("id is invalid so search")
        }

        const p = await this.permissionModel.findById(id);
        const deleteResult = await this.permissionModel.deleteOne({ _id: id });
        if (deleteResult.deletedCount === 0) {
            throw new InternalServerErrorException('Failed to delete permission');
        }        
        await this.roleModel.updateMany(
            {permissions : id},
            { $pull : {permissions : id}}
        )

        await this.logsService.logAction(user , "Delete-Permission" , "Permission" , user._id , `Has Deleted the Permission : [${p?.name}]`)

        return{success : true , message :"permission deleted successfully" }
    }

    async getPermissions(){
        const permissions = await this.permissionModel.find();
        return {
            success : true , 
            permissions
        }
    }

    async addPermissionsToRole(dto : AddPermissionsToRoleDto){
        const {permissionsIds , roleId} = dto;

        if (!Array.isArray(permissionsIds) || !roleId)
            throw new BadRequestException("Missing or invalid 'permissionsIds' array or 'roleId'")

        const role = await this.roleModel.findById(roleId).populate("permissions")
        if(!role)
            throw new NotFoundException("role not found ")

        const validPermissions = await this.permissionModel.find({
            _id : {$in : permissionsIds}
        })
        if(validPermissions.length !== permissionsIds.length)
            throw new BadRequestException("One or more permission IDs are invalid")

        const updatedRole = await this.roleModel.findByIdAndUpdate(roleId , 
            {permissions : permissionsIds},
            {new : true}
        )

        // const user = req.user;
        // await logAction(user , "Add-Permission" , "Permission" , user._id , `Has Changed the ${role.role} Permissions`)

        return {
            success: true,
            message: "Permissions Added Successfully",
            data: updatedRole,
        }
    }

    async getRoleById(id : string){
        if(!isValidObjectId(id)){
            throw new BadRequestException("id is invalid so search")
        }
        const role = await this.roleModel.findById(id).populate("permissions")
        return {success: true , role}
    }

    async deleteRole(id : string){
        if(!isValidObjectId(id)){
            throw new BadRequestException("id is invalid so search")
        }
        const roleToDelete = await this.roleModel.findById(id);
        if (!roleToDelete) {
            throw new NotFoundException('Role not found');
        }

        const usersToReassign = roleToDelete.user || [];

        let userRole = await this.roleModel.findOne({ role: 'user' });
        if (!userRole) {
            userRole = new this.roleModel({ role: 'user', user: [] });
        }

        // Merge and remove duplicates
        userRole.user = Array.from(new Set([...userRole.user, ...usersToReassign]));

        await userRole.save();

        await this.roleModel.findByIdAndDelete(id);

        const roles = await this.roleModel.find().populate('permissions');

        // Log the action
        // await logAction(user, 'Delete-Role', 'Role', id, `Has Deleted the Role ${roleToDelete.role}`);

        return {
            success: true,
            message: 'Role deleted and users reassigned.',
            roles,
        };
    }


    
    async createPermissionAlone(permissionName: string, permissionDescription: string) {
        const permission = this.permissionRepo1.create({
            permission_name: permissionName,
            permission_description: permissionDescription,
        });

        return this.permissionRepo1.save(permission);
        }


    async createRoleWithPermissions(roleName : string , permissionIds : number[] ){
        const permissions = await this.permissionRepo1.findByIds(permissionIds);

            const role = this.rolesRepo.create({
            role_name: roleName,
            permissions: permissions,
            });

            return this.rolesRepo.save(role);
    }

    async addPermissionToRole(roleId : number , permissionId : number ){
        const role = await this.rolesRepo.findOne({where : {role_id : roleId}})
        if(!role)
            throw new NotFoundException("role not found ")

        const permission = await this.permissionRepo1.findOne({where : {permission_id : permissionId}})
        if(!permission)
            throw new NotFoundException("permission not found")

        role.permissions.push(permission);
        return this.rolesRepo.save(role);
    }

    async findRoleWithPermissions(roleId: number) {
    return this.rolesRepo.findOne({
      where: { role_id: roleId },
      relations: ['permissions'],
    });
  }
}
