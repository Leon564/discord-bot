import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

import { Database, Reference } from 'firebase-admin/database';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class FirebaseService {
  private database: Database;
  private chatContext: Reference;
  private channelsContext: Reference;

  init() {
    this.database = admin.database();
    this.chatContext = this.database.ref('chatContext');
    this.channelsContext = this.database.ref('channels');
  }
  saveChatContext(channelId: string, messages: IMessage[]): Promise<any> {
    this.init();

    return messages.reduce(async (prevPromise: any, message: any) => {
      await prevPromise;
      return this.chatContext.child(channelId).push(message);
    }, Promise.resolve());
  }

  getChatContext(channelId: string): Promise<any[]> {
    this.init();
    return this.chatContext
      .child(channelId)
      .limitToLast(50)
      .once('value')
      .then((snapshot) => {
        const result = snapshot.val();
        if (result && !Array.isArray(result)) {
          return Object.values(result);
        }
        return result;
      });
  }

  addChannelToChat(channelId: string): Promise<any> {
    this.init();
    return this.channelsContext.child(channelId).set(true);
  }

  removeChannelFromChat(channelId: string): Promise<any> {
    this.init();
    return this.channelsContext.child(channelId).remove();
  }

  getChannelInChat(channelId: string): Promise<boolean> {
    this.init();
    return this.channelsContext
      .child(channelId)
      .once('value')
      .then((snapshot) => {
        const result = snapshot.val();
        return result ? result : false;
      });
  }

  resetChatContext(channelId: string, botName?: string): Promise<IMessage[]> {
    this.init();
    const initialMessages: IMessage[] = [
      botName
        ? {
            role: 'system',
            content: `te llamas ${botName} y eres un asistente de estudio `,
          }
        : {
            role: 'system',
            content: 'sabes todo sobre anime',
          },
      {
        role: 'system',
        content: `cuando el usuario dice que '!reset' se resetea la conversación`,
      },
      {
        role: 'system',
        content: 'responde de la manera mas puntual y corta posible',
      },
      {
        role: 'system',
        content:
          'eres un asistente de estudio y tratas de ser lo mas preciso posible',
      },
    ];

    return this.chatContext
      .child(channelId)
      .set(initialMessages)
      .then(() => {
        return initialMessages;
      });
  }
}
