// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import mongoose from 'mongoose';
// import { join } from 'path';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.setGlobalPrefix("/api")
//   app.enableCors({
//     origin : ['http://localhost:5173'] ,
//     credentials  : true ,
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     allowedHeaders: 'Content-Type, Authorization',
//   })

//   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
//     prefix: '/uploads/',
//   });

//   mongoose.connection.on('connected', () => {
//     console.log('Successfully connected to MongoDB');
//   });

//   mongoose.connection.on('error', (err) => {
//     console.error('MongoDB connection error:', err);
//   });
//   let port = process.env.PORT || 3000
//   await app.listen(process.env.PORT || 3000);
//   console.log(`Server running on http://localhost:${port}/api`);
// }
// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express'; // <-- add this
import mongoose from 'mongoose';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // <-- change here
  
  app.setGlobalPrefix("/api");
  app.enableCors({
    origin : ['http://localhost:5173'],
    credentials  : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useStaticAssets(join(__dirname, '..', '..', 'public'));


  mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}/api`);
}
bootstrap();
