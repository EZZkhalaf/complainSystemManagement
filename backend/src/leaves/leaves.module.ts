import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeavesEntity } from './entities/leaves.entity';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { UserModule } from 'src/user/user.module';
import { GroupsModule } from 'src/groups/groups.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RolesModule } from 'src/roles/roles.module';

@Module({

    imports : [
        forwardRef(()=> RolesModule),
        forwardRef(()=> UserModule),
        forwardRef(()=>GroupsModule),
        
        TypeOrmModule.forFeature([
            LeavesEntity
        ]) ,

    ],
    controllers:[LeavesController],
    providers:[LeavesService , JwtService],
    exports : [TypeOrmModule ]


})
export class LeavesModule {}
