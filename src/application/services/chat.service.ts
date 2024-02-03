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

  async send(message: string, channelId: string): Promise<string> {
    try {
      const chatContext = await this.firebaseService.getChatContext(channelId);

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
      throw err;
    }
  }
}
