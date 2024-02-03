import { Client, Events, GatewayIntentBits } from 'discord.js';
import {
  Server,
  CustomTransportStrategy,
  BaseRpcContext,
} from '@nestjs/microservices';
import { MessageWithChannelName } from 'src/domain/types/request-message.type';
import { ResponseMessage } from 'src/domain/types/response-message.type';
import { SendMessageMapper } from './discord.mapper';
import { Inject, Logger } from '@nestjs/common';
import { appConfig } from 'src/configs/app.config';
import { ConfigType } from '@nestjs/config';

export class DiscordTransport
  extends Server
  implements CustomTransportStrategy
{
  constructor(
    @Inject(appConfig.KEY) private configs: ConfigType<typeof appConfig>,
  ) {
    super();
  }

  listen() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const parent = this;
    console.log('baileys started');

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
      ],
    });

    client.login(this.configs.discordToken);

    client.on(Events.MessageCreate, async (message: MessageWithChannelName) => {
      if (message.author.bot) return;
      this.logMessage(message);
      const { channel } = message;
      const pattern = 'message';
      const handler = parent.messageHandlers.get(pattern);
      const ctx = new BaseRpcContext(<any>{});
      if (handler) {
        const payload = {
          pattern,
          data: message,
          options: { BotUser: client.user },
        };
        const result: ResponseMessage = await handler(payload, ctx);
        result && this.sendMessage(message, channel, result);
      }
    });
  }

  close() {
    console.log('baileys closed');
  }

  private sendMessage(
    message: MessageWithChannelName,
    channel: any,
    body: ResponseMessage,
  ): void {
    const payload = SendMessageMapper.toSocket(body);
    if (body.isReply) {
      message.reply(payload);
      return;
    }
    channel.send(payload);
  }

  private logMessage(message: MessageWithChannelName): void {
    const { channel, content: msg } = message;
    const raw = JSON.stringify({ chanel: channel.name, text: msg });
    Logger.log(raw);
  }
}
