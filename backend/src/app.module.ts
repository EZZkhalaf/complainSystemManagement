import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ComplaintModule } from './complaint/complaint.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GroupsModule } from './groups/groups.module';
import { LogsModule } from './logs/logs.module';
import { RolesModule } from './roles/roles.module';
import { DatabaseService } from './database.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LeavesController } from './leaves/leaves.controller';
import { LeavesService } from './leaves/leaves.service';
import { LeavesModule } from './leaves/leaves.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    MongooseModule.forRoot(process.env.CONNECTION_STRING ||"invalid connection string "),
    ComplaintModule,
    AuthModule,
    UserModule,
    GroupsModule,
    LogsModule,
    RolesModule,
    ServeStaticModule.forRoot({
      rootPath : join(__dirname,"..","public","uploads"),
      serveRoot:"/uploads"
    }) ,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5434,
      username: 'postgres',
      password: '1234',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true, // only for dev
    }),
    LeavesModule
  ],
  controllers: [AppController, LeavesController],
  providers: [AppService , DatabaseService, LeavesService , JwtService],
})
export class AppModule {
  constructor(private dataSource : DataSource){}

  async onApplicationBootstrap(){
    if (this.dataSource.isInitialized) {
      console.log('Connected to Postgres database');
    } else {
      console.error('Failed to connect to Postgres database');
    }
  }
}
