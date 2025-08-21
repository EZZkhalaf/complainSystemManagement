import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeavesEntity } from './entities/leaves.entity';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { UserModule } from 'src/user/user.module';

@Module({

    imports : [
        forwardRef(()=> UserModule),
        TypeOrmModule.forFeature([
            LeavesEntity
        ]) ,

    ],
    controllers:[LeavesController],
    providers:[LeavesService],
    exports : [TypeOrmModule]


})
export class LeavesModule {}
