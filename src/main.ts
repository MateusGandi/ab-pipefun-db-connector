import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as os from 'os';
import { Logger } from '@nestjs/common';

const loggerApp = new Logger('App');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const envFile = process.env.NODE_ENV === 'production' ? '.env.docker' : '.env';
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  loggerApp.log(`Usando o arquivo com variáveis de ambiente: ${envFile}`);
} else {
  loggerApp.log(`Arquivo com variáveis de ambiente ${envFile} não encontrado!`);
  process.exit(1);
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API MongoDB Connector')
    .setDescription('Documentação da API para consultas no MongoDB')
    .setVersion('1.0')
    .addTag('mongo')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const host = process.env.APP_HOST || getLocalIP();
  const port = process.env.APP_PORT || 3000;
  logger.log(`App running on http://localhost:${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api`);

  await app.listen(port);
}
bootstrap();