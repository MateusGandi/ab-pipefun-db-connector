import { Module } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { MongoController } from './mongo.controller';
import { DatabaseModule } from '../config/database/database.module';

@Module({
  imports: [DatabaseModule], 
  providers: [MongoService],
  controllers: [MongoController]
})

export class MongoModule {}


