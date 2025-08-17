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
import { In, Repository } from 'typeorm';
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

        // const existingRole = await this.roleModel.findOne({role : newRole})
        const existingRole = await this.rolesRepo.findOne({
            where : { role_name : newRole}
        })
        if(existingRole)
            throw new BadRequestException("role already exists")
        const createdRole =  this.rolesRepo.create({
            role_name : newRole ,
            users : []
        })

        if(!createdRole)
            throw new InternalServerErrorException("error creating the role ")
        await this.rolesRepo.save(createdRole)
        const createdRoleId = createdRole.role_id 
        const user = req.user
        await this.logsService.logAction(user , "Add-Role" , "Role" , createdRoleId , `Has Created New Role : ${newRole}`)

        return {
            success : true ,
             message : "role created successfully" , 
             createdRole
        }
    }

    async getRoles(){
        // const roles = await this.roleModel.find().populate("permissions")
        const roles = await this.rolesRepo
            .createQueryBuilder("role_info")
            .leftJoinAndSelect("role_info.permissions", "permission_info")
            .leftJoin("role_info.users", "user_info") // join but don't select everything
            .addSelect(["user_info.user_name"]) // only pick user_name
            .getMany();
        return {success : true , roles}
    }



    async addPermissions(user: any, permissions: CreatePermissionDto[]) {
        try {
            if (!Array.isArray(permissions)) {
                permissions = [permissions]
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

            const existing = await this.permissionRepo1.find({
                where: { permission_name: In(uniquePermissions.map((p) => p.name)) },
                select: ['permission_name'],
            });

            const existingNames = new Set(existing.map((p) => p.permission_name));
            const newPermissions = uniquePermissions.filter(
                (p) => !existingNames.has(p.name),
            );

            if (newPermissions.length === 0) {
                return {
                    success: true,
                    message: 'No new permissions to add (all already exist)',
                };
            }
            const inserted = await this.permissionRepo1.save(
                newPermissions.map((p) => ({
                    permission_name: p.name,
                    permission_description: p.description,
                }))
            );




            await this.logsService.logAction(
                user,
                'Add-Permission',
                'Permission',
                user.user_id,
                `Added permissions: [${newPermissions.map(p => p.name).join(', ')}]`
            );

            return {
                success: true,
                message: 'New permissions added successfully',
                data: inserted,
            };
        } catch (err) {
            console.error(err);
            throw new InternalServerErrorException('Internal server error');
        }
    }




    async deletePermission(user: any, id: string) {
        const permission = await this.permissionRepo1.findOne({
            where: { permission_id: Number(id) },
        });

        if (!permission) {
            throw new NotFoundException('Permission not found');
        }

        // 2. Remove the permission from all roles that have it
        const rolesWithPermission = await this.rolesRepo.find({
            relations: ['permissions'],
            where: { permissions: { permission_id: Number(id) } },
        });

        for (const role of rolesWithPermission) {
            role.permissions = role.permissions.filter(
                (perm) => perm.permission_id !== Number(id)
            );
            await this.rolesRepo.save(role);
        }

        // 3. Delete the permission
        await this.permissionRepo1.delete(id);

        await this.logsService.logAction(
            user,
            "Delete-Permission",
            "Permission",
            user.user_id,
            `Has Deleted the Permission : [${permission?.permission_name}]`
        );

        return { success: true, message: 'Permission deleted successfully' };
    }


    async getPermissions(){
        // const permissions = await this.permissionModel.find();
        const permissions = await this.permissionRepo1.find()
        return {
            success : true , 
            permissions
        }
    }

    async addPermissionsToRole(dto : AddPermissionsToRoleDto , req:any){
        const {permissionsIds , roleId} = dto;

        const user = req.user;
        if (!Array.isArray(permissionsIds) || !roleId)
            throw new BadRequestException("Missing or invalid 'permissionsIds' array or 'roleId'")

        // const role = await this.roleModel.findById(roleId).populate("permissions")

        const role = await this.rolesRepo.findOne({
            where : {role_id : Number(roleId)},
            relations : ['permissions']
        })
        if(!role)
            throw new NotFoundException("role not found ")

        // const validPermissions = await this.permissionModel.find({
        //     _id : {$in : permissionsIds}
        // })

        const validPermissions = await this.permissionRepo1.find({
            where : {permission_id : In(permissionsIds)}
        })
        if(validPermissions.length !== permissionsIds.length)
            throw new BadRequestException("One or more permission IDs are invalid")


        // const updatedRole = await this.roleModel.findByIdAndUpdate(roleId , 
        //     {permissions : permissionsIds},
        //     {new : true}
        // )

        role.permissions = validPermissions
        const updatedRole = await this.rolesRepo.save(role)

        // const user = req.user;
        await this.logsService.logAction(user , "Add-Permission" , "Permission" , user.user_id , `Has Changed the ${role.role_name} Permissions`)

        return {
            success: true,
            message: "Permissions Added Successfully",
            data: updatedRole,
        }
    }

    async getRoleById(id : string){
        // if(!isValidObjectId(id)){
        //     throw new BadRequestException("id is invalid so search")
        // }
        // const role = await this.roleModel.findById(id).populate("permissions")
        const role = await this.rolesRepo.findOne({
            where : {role_id : Number(id)},
            relations:['permissions']
        })
        return {success: true , role}
    }

    async deleteRole(id : string , req : any){
        // if(!isValidObjectId(id)){
        //     throw new BadRequestException("id is invalid so search")
        // }
        // const roleToDelete = await this.roleModel.findById(id);
        const user = req.user;
        const roleToDelete = await this.rolesRepo.findOne({
            where : {role_id : Number(id)},
            relations : ['users' , "permissions"]
        })
        if (!roleToDelete) {
            throw new NotFoundException('Role not found');
        }

        const usersToReassign = roleToDelete.users || [];

        // let userRole = await this.roleModel.findOne({ role: 'user' });

        let userRole = await this.rolesRepo.findOne({
            where : {role_name : 'user'},
            relations : ['users']
        })
        if (!userRole) {
            userRole = this.rolesRepo.create({
                role_name : 'user',
                users :[]
            })
        }

        const mergedUsers = Array.from(
            new Set([...(userRole.users || []), ...usersToReassign])
        )

        // Merge and remove duplicates
        userRole.users = mergedUsers

        // await userRole.save();

        await this.rolesRepo.save(userRole)

        // await this.roleModel.findByIdAndDelete(id);
        await this.rolesRepo.delete(id)

        // const roles = await this.roleModel.find().populate('permissions');
        const roles = await this.rolesRepo.find({
            relations : ['permissions' ]
        })
        
        // Log the action
        await this.logsService.logAction(user, 'Delete-Role', 'Role', id, `Has Deleted the Role ${roleToDelete.role_name}`);

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
        // const permissions = await this.permissionRepo1.findByIds(permissionIds);

        const  permissions = await this.permissionRepo1.find({
            where : {permission_id : In(permissionIds)}
        })

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
