import { Injectable, Inject } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';

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

  // async createConfig(name_db: string, name_collection: string, data: { id: string, data: any }): Promise<any> {
  //   const collection = this.getCollection(name_db, name_collection);
  //   const objectId = new ObjectId(data.id);
  //   const result = await collection.insertOne({ _id: objectId, ...data.data });
  //   return { _id: result.insertedId, ...data.data };
  // }

  async updateConfig(name_db: string, name_collection: string, data: { id: string, [key: string]: any }): Promise<any> {
    const collection = this.getCollection(name_db, name_collection);
  
    const objectId = new ObjectId(data.id);
    
    const { id, ...updateFields } = data;
  
    Object.keys(updateFields).forEach(key => {
      if (Array.isArray(updateFields[key])) {
        const items = updateFields[key];
  
        items.forEach(item => {
          if (!item.name) {
            throw new BadRequestException(`O atributo 'name' é obrigatório em cada objeto do array '${key}'`);
          }
        });
  
        const names = items.map(item => item.name);
        const uniqueNames = new Set(names);
        if (names.length !== uniqueNames.size) {
          throw new BadRequestException(`O atributo 'name' deve ser único dentro do array '${key}'`);
        }
  
        updateFields[key] = items.map(item => ({
          ...item,
          _id: new ObjectId(),  
        }));
      }
    });
  
    const existingDocument = await collection.findOne({ _id: objectId });
  
    if (existingDocument) {
      const updatedDocument = await collection.updateOne(
        { _id: objectId },
        {
          $set: updateFields,
        }
      );
      return { message: 'Documento atualizado com sucesso', updatedCount: updatedDocument.modifiedCount };
    } else {
      return { message: 'Documento não encontrado', _id: objectId };
    }
  }

  async deleteConfig(
    name_db: string,
    name_collection: string,
    id: string,
    objectId: string
  ): Promise<any> {
    const collection = this.getCollection(name_db, name_collection);
  
    const documentId = new ObjectId(id);
    const objectToDeleteId = new ObjectId(objectId);
  
    // Passo 1: Obtenha o documento para determinar os arrays dinamicamente
    const document = await collection.findOne({ _id: documentId });
  
    if (!document) {
      throw new Error('Documento não encontrado');
    }
  
    // Passo 2: Crie o operador de atualização dinâmico $pull para remover do array correto
    const pullUpdate: any = { $pull: {} };
  
    // Para cada chave no documento, se for um array, vamos adicionar um pull para aquele array
    for (const key in document) {
      if (Array.isArray(document[key])) {
        pullUpdate.$pull[key] = { _id: objectToDeleteId };
      }
    }
  
    // Passo 3: Execute a atualização
    const result = await collection.updateOne(
      { _id: documentId },
      pullUpdate
    );
  
    if (result.modifiedCount > 0) {
      return { message: 'Objeto deletado com sucesso' };
    } else {
      return { message: 'Objeto não encontrado ou não foi possível deletar' };
    }
  }

}  