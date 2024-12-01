import { Module } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { Logger } from '@nestjs/common';


@Module({
  providers: [
    {
      provide: 'MONGO_CONNECTION',
      useFactory: async () => {
        const logger = new Logger('DatabaseModule');

        const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
        
        const dbName = process.env.MONGO_DB_APP;
        const collectionName = process.env.MONGO_COLLECTION;

        try {
          const connection = await mongoose.createConnection(uri);
          logger.log('Conexão com MongoDB estabelecida na base admin');

          const db = connection.useDb(dbName);
          
          const collections = await db.listCollections();

          const collectionExists = !!collections.find(c => c.name === collectionName);

          if (!collectionExists) {
            await db.createCollection(collectionName);
            logger.log(`Collection '${collectionName}' criada no database '${dbName}'`);
          } else {
            logger.log(`Collection '${collectionName}' já existe no database '${dbName}'`);
          }

          return connection;
        } catch (error) {
          logger.error('Erro ao conectar ao MongoDB', error.message);
          throw error;
        }
      },
    },
  ],
  exports: ['MONGO_CONNECTION'],
})
export class DatabaseModule {}