import { Injectable, Inject } from '@nestjs/common';
import { Connection } from 'mongoose';

@Injectable()
export class MongoService {
  constructor(@Inject('MONGO_CONNECTION') private readonly mongoConnection: Connection) {}

  private getCollection(name_db: string, name_collection: string) {
    const db = this.mongoConnection.useDb(name_db);
    return db.collection(name_collection);
  }

  async findConfigurationByName(name_db: string, name_collection: string, name_document: string): Promise<any> {
    const collection = this.getCollection(name_db, name_collection);
    const document = await collection.findOne({ name: name_document });
    return document;
  }

  async findAllConfigurations(name_db: string, name_collection: string): Promise<any[]> {
    if (!name_db) {
      throw new Error('O nome do banco de dados (name_db) é obrigatório.');
    }
    if (!name_collection) {
      throw new Error('O nome da coleção (name_collection) é obrigatório.');
    }

    const collection = this.getCollection(name_db, name_collection);
    const documents = await collection.find({}).toArray();
    return documents;
  }

  async createConfiguration(name_db: string, name_collection: string, data: any): Promise<any> {
    const collection = this.getCollection(name_db, name_collection);
    const result = await collection.insertOne(data);
  
    return { _id: result.insertedId, ...data };
  }

  async deleteConfiguration(name_db: string, name_collection: string, name_document: string): Promise<boolean> {
    const collection = this.getCollection(name_db, name_collection);
    const result = await collection.deleteOne({ name: name_document });
    return result.deletedCount > 0;
  }
}
