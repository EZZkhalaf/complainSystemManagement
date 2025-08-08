import { Injectable, OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    if (this.connection.readyState === 1) { // 1 = connected
      console.log('✅ MongoDB connection is ready');
    } else {
      this.connection.once('connected', () => {
        console.log('✅ MongoDB connection established (from DatabaseService)');
      });
      this.connection.once('error', (err) => {
        console.error('❌ MongoDB connection error (from DatabaseService):', err);
      });
    }
  }
}
