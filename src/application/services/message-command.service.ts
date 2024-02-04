import { Injectable } from '@nestjs/common';
import { CommandName } from 'src/domain/enums/command-name.enum';
import { MessageResponseType } from 'src/domain/enums/message-response-type.enum';
import { ResponseMessage } from 'src/domain/types/response-message.type';
import { ChatService } from './chat.service';
import { FirebaseService } from './firebase.service';
import { MessageWithChannelName } from 'src/domain/types/request-message.type';
import { handleOptions } from 'src/domain/types/handle-options.type';
import { ClientUser } from 'discord.js';

@Injectable()
export class MessageCommandService {
  private BotUser: ClientUser;

  constructor(
    private firebaseService: FirebaseService,
    private chatService: ChatService,
  ) {}

  async handle(
    payload: MessageWithChannelName,
    options: handleOptions,
  ): Promise<any> {
    this.BotUser = options.BotUser;
    const text = payload?.content || '';

    if (this.testPattern(CommandName.PING, text)) {
      return this.ping(payload);
    }

    if (this.testPattern(CommandName.RESET, text)) {
      return this.reset(payload);
    }

    if (this.testPattern(CommandName.GPT, text)) {
      return this.gpt(payload);
    }

    if (this.testPattern(CommandName.RGPT, text)) {
      return this.removeChannelFromChat(payload);
    }

    return this.chat(payload);
  }

  private testPattern(pattern: string, text: string): boolean {
    const validator = new RegExp(`^${pattern}\\b`, 'gi');
    return validator.test(text);
  }

  private ping(payload: MessageWithChannelName): ResponseMessage {
    return { type: MessageResponseType.text, text: 'pong 🏓', isReply: true };
  }

  private async chat(
    payload: MessageWithChannelName,
  ): Promise<ResponseMessage> {
    const isInChat = await this.firebaseService.getChannelInChat(
      payload.channelId,
    );
    if (isInChat) {
      const chat = await this.chatService.send(
        payload.content,
        payload.channelId,
        this.BotUser.username,
      );
      return { type: MessageResponseType.text, text: chat, isReply: true };
    }
  }

  private async gpt(payload: MessageWithChannelName): Promise<ResponseMessage> {
    try {
      await this.firebaseService.addChannelToChat(payload.channelId);
      return {
        type: MessageResponseType.text,
        text: 'Chat iniciado',
        isReply: true,
      };
    } catch (err) {
      return {
        type: MessageResponseType.text,
        text: 'Error al iniciar el chat',
        isReply: true,
      };
    }
  }

  private async removeChannelFromChat(
    payload: MessageWithChannelName,
  ): Promise<ResponseMessage> {
    try {
      await this.firebaseService.removeChannelFromChat(payload.channelId);
      return {
        type: MessageResponseType.text,
        text: 'Canal elimido de la conversación',
        isReply: true,
      };
    } catch (err) {
      return {
        type: MessageResponseType.text,
        text: 'Error al finalizar el chat',
        isReply: true,
      };
    }
  }

  private async reset(
    payload: MessageWithChannelName,
  ): Promise<ResponseMessage> {
    await this.firebaseService.resetChatContext(
      payload.channelId,
      this.BotUser.username,
    );
    return {
      type: MessageResponseType.text,
      text: 'Contexto de la conversación reiniciado',
      isReply: true,
    };
  }
}
