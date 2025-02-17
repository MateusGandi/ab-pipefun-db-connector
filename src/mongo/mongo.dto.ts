import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';


/**
 * DTO para criação de uma configuração.
 */
export class CreateConfigurationDto {
  @ApiProperty({
    description: 'Nome da configuração',
    example: 'GDX',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição da configuração',
    example: 'Configuração para GDX',
  })
  description: string;

  @ApiProperty({
    description: 'Valor da configuração',
    example: 42,
  })
  value: number;
}

/**
 * DTO para exclusão de uma configuração.
 */
export class DeleteConfigurationDto {
  @ApiProperty({
    description: 'Nome da configuração a ser deletada',
    example: 'GDX',
  })
  name: string;
}

/**
 * DTO para criação de uma configuração com metadados do banco de dados.
 */
 export class CreateConfigurationWithMetadataDto extends CreateConfigurationDto {
  @ApiProperty({
    description: 'Nome do banco de dados',
    example: 'pipefun',
  })
  name_db: string;

  @ApiProperty({
    description: 'Nome da coleção',
    example: 'configuracoes',
  })
  name_collection: string;
}

export class CreateBankConfigDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  user: string;

  @IsString()
  password: string;

  @IsString()
  host: string;

  @IsString()
  porta: string;

  @IsString()
  serviceName: string;

  @IsString()
  sid: string;
}

export class CreateBankConfigRequestDto {
  @IsString()
  configId: string;

  @IsObject()
  bankData: CreateBankConfigDto;
}