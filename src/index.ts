import { Client, Events, GatewayIntentBits, Message } from "discord.js";
import "dotenv/config";
import { Gpt } from "./gpt";

type MessageP = {
  channel: {
    name?: string;
  };
};

type MessageWithChannelName = Message & MessageP;

class Bot {
  private client: Client;
  private intents: GatewayIntentBits[];
  private token: string;
  private gpt: Gpt;
  constructor() {
    this.intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent];
    this.token = process.env.DISCORD_TOKEN || "";
    this.client = new Client({ intents: this.intents });
    this.gpt = new Gpt();
  }
  public start() {
    this.client.login(this.token);
    this.client.on(Events.ClientReady, () => {
      console.log("Client ready!");
    });

    this.client.on(Events.MessageCreate, (message: MessageWithChannelName) => {
        
        
      if (
        !message.member?.user.bot &&
        message.channel.name === process.env.CHANNEL_NAME &&
        message.content.split(" ").length > 3
      ) {
        console.log(`meesage: ${message.content}----from: ${message.member?.user.username}`);
        this.gpt
          .chat(message.content, process.env.BOT_NAME)
          .then((response) => {
            message.reply(response || "No se que decir");
          });
      }
    });
  }
}
const bot = new Bot();
bot.start();
