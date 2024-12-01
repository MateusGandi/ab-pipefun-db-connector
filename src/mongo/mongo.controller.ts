import { Controller, Get, Post, Delete, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { MongoService } from './mongo.service';
import { CreateConfigurationWithMetadataDto, DeleteConfigurationDto } from './mongo.dto';

@ApiTags('mongo')
@Controller('mongo')
export class MongoController {
  constructor(private readonly mongoService: MongoService) {}

  @ApiOperation({ summary: 'Consulta uma configuração pelo name do document no mongodb' })
  @Get('')
  async findConfiguration(
    @Query('name_db') name_db: string,
    @Query('name_collection') name_collection: string,
    @Query('document') document: string,
  ) {
    const dbName = name_db || process.env.MONGO_DB_APP;
    const collectionName = name_collection || process.env.MONGO_COLLECTION;

    const result = await this.mongoService.findConfigurationByName(dbName, collectionName, document);
    if (!result) {
      return { message: `Configuração com nome ${document} não encontrado.` };
    }
    return result;
  }

  @Get('findAll')
  async findAllConfigurations(
    @Query('name_db') name_db: string, 
    @Query('name_collection') name_collection: string
  ) {
    const dbName = name_db || process.env.MONGO_DB_APP;
    const collectionName = name_collection || process.env.MONGO_COLLECTION;
    return await this.mongoService.findAllConfigurations(dbName, collectionName);
  }

  @ApiOperation({ summary: 'Cria uma nova configuração com metadados' })
  @ApiBody({ type: CreateConfigurationWithMetadataDto })
  @Post('')
  async createConfiguration(
    @Body() data: CreateConfigurationWithMetadataDto,
  ) {
    const { name_db, name_collection, ...filteredData } = data;
    const dbName = name_db || process.env.MONGO_DB_APP;
    const collectionName = name_collection || process.env.MONGO_COLLECTION;

    return this.mongoService.createConfiguration(dbName, collectionName, filteredData);
  }

  @ApiOperation({ summary: 'Deleta uma configuração pelo atributo name do document' })
  @Delete('')
  async deleteConfiguration(
    @Query('name_db') name_db: string, 
    @Query('name_collection') name_collection: string, 
    @Query('document') document: string
  ) {
    const dbName = name_db || process.env.MONGO_DB_APP;
    const collectionName = name_collection || process.env.MONGO_COLLECTION;

    const deleted = await this.mongoService.deleteConfiguration(dbName, collectionName, document);
    if (!deleted) {
      return { message: `Não foi encontrado o document com o nome ${document} para ser deletado.` };
    }
    return { message: `Document com o nome ${document} deletado com sucesso.` };
  }
}