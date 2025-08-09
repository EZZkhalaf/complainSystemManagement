import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("/api")
  app.enableCors({
    origin : ['http://localhost:5173'] ,
    credentials  : true ,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  })

  mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  let port = process.env.PORT || 3000
  await app.listen(process.env.PORT || 3000);
  console.log(`Server running on http://localhost:${port}/api`);
}
bootstrap();
