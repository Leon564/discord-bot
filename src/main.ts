import { NestFactory } from '@nestjs/core';
import * as admin from 'firebase-admin';
import { AppModule } from './app.module';
import { DiscordTransport } from './infrastructure/transporters/discord.transport';
import { appConfig } from './configs/app.config';
import { ConfigType } from '@nestjs/config';
import { firebaseConfig } from './configs/firebase.config';
import { ServiceAccount } from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appConfigs = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  const firebaseConfigs = app.get<ConfigType<typeof firebaseConfig>>(
    firebaseConfig.KEY,
  );

  const adminConfig: ServiceAccount = {
    projectId: firebaseConfigs.projectId,
    privateKey: firebaseConfigs.privateKey.replace(/\\n/g, '\n'),
    clientEmail: firebaseConfigs.clientEmail,
  };

  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: firebaseConfigs.dataBaseUrl,
  });

  const { port } = appConfigs;

  app.connectMicroservice({
    strategy: new DiscordTransport(appConfigs),
  });

  await app.startAllMicroservices();
  await app.listen(port);
}

bootstrap();
