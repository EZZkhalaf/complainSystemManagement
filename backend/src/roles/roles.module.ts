import { forwardRef, Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PremissionSchema } from './schemas/permission.schema';
import { LogsModule } from 'src/logs/logs.module';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { RoleRepository } from './roles.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesEntity } from './entities/roles.entity';
import { PermissionRepository } from './permission.repository';
import { PermissionEntity } from './entities/permission.entity';
import { UserModule } from 'src/user/user.module';
import { UserEntity } from 'src/user/entities/user.entity';

@Module({
  imports :[
    MongooseModule.forFeature([
      {name : Role.name , schema : RoleSchema},
      {name : User.name , schema : UserSchema},
      {name : Permission.name , schema : PremissionSchema}
    ]),
    
      forwardRef(() =>LogsModule),   
    
     forwardRef(()=> UserModule),

    TypeOrmModule.forFeature([
      RolesEntity , PermissionEntity 
    ])
  ],
  controllers: [RolesController],
  providers: [RolesService , JwtService , RoleRepository,PermissionRepository] ,
  exports:[TypeOrmModule]
})
export class RolesModule {}
