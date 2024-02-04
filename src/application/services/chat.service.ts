import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import OpenAIApi from 'openai';
import { appConfig } from 'src/configs/app.config';
import { IMessage, FirebaseService } from './firebase.service';

@Injectable()
export class ChatService {
  private openai: OpenAIApi;

  constructor(
    @Inject(appConfig.KEY) private configs: ConfigType<typeof appConfig>,
    private firebaseService: FirebaseService,
  ) {
    const apiKey = this.configs.openAiApiKey;

    this.openai = new OpenAIApi({ apiKey });
  }

  async send(
    message: string,
    channelId: string,
    BotUser: string,
  ): Promise<string> {
    try {
      let chatContext = await this.firebaseService.getChatContext(channelId);
      if (!chatContext) {
        chatContext = await this.firebaseService.resetChatContext(
          channelId,
          BotUser,
        );
      }

      const gptResponse = await this.openai.chat.completions.create({
        messages: [
          ...chatContext,
          {
            role: 'user',
            content: message || '',
          },
        ],

        model: 'gpt-3.5-turbo',
      });
      const response = gptResponse.choices[0].message.content;

      const messages: IMessage[] = [
        {
          role: 'user',
          content: message || '',
        },
        {
          role: 'assistant',
          content: response || '',
        },
      ];

      await this.firebaseService.saveChatContext(channelId, messages);

      return response;
    } catch (err) {
      Logger.error('Error on ChatGPT response');
      if (err.code === 'context_length_exceeded') {
        return 'El contexto de la conversación es muy largo, por favor reinicia la conversación con !reset';
      }
      throw err;
    }
  }
}
