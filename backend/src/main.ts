
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express'; // <-- add this
import mongoose from 'mongoose';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
const cookieParser = require("cookie-parser")
const cookieSession =  require('cookie-session');
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // <-- change here
    
  
  const config = new DocumentBuilder()
    .setTitle("Complaint Maagement System API Routes")
    .setDescription("API Docs for complaints")
    .setVersion("1.0")
    .addBearerAuth()
    .build()

    const document = SwaggerModule.createDocument(app,config)
    SwaggerModule.setup("api-docs" , app,document)
  
  app.use(cookieParser())
  app.use(
    cookieSession({
      name: 'session',
      keys: [process.env.COOKIE_SECRET || 'default_secret_key'],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,  // better security
      secure: process.env.NODE_ENV === 'production', // send only over HTTPS in prod
    }),
  );

  app.setGlobalPrefix("/api");
  app.enableCors({
    origin : ['http://localhost:5173'],
    credentials  : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useStaticAssets(join(__dirname, '..', '..', 'public'));


  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, 
      transformOptions: { enableImplicitConversion: true }, // allow automatic string->number
    }),
  );

  mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  const dataSource = app.get(DataSource)
  
    if(dataSource.isInitialized){
    console.log('✅ Connected to Postgres database');
    }else{
      console.log("postgres db is not initialized")
    }


  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}/api`);
}
bootstrap();
