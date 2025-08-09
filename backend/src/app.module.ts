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
    })
  ],
  controllers: [AppController],
  providers: [AppService , DatabaseService],
})
export class AppModule {
  
}
