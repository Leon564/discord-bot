import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './application/controllers/app.controller';
import { ChatService } from './application/services/chat.service';
import { MessageCommandService } from './application/services/message-command.service';
import { FirebaseService } from './application/services/firebase.service';
import { appConfig } from './configs/app.config';
import { firebaseConfig } from './configs/firebase.config';

@Module({
  controllers: [AppController],
  imports: [ConfigModule.forRoot({ load: [appConfig, firebaseConfig] })],
  providers: [MessageCommandService, FirebaseService, ChatService],
})
export class AppModule {}
