import "dotenv/config";
import Openai from "openai";
import { FirebaseService } from "./firebase";
import { IMessage } from "./firebase";
export class Gpt {
  constructor(
    private openai = new Openai({ apiKey: process.env.OPENAI_API_KEY }),
    //private chatContext: any[] = [],
    private firebaseService = new FirebaseService()
  ) {}

  async chat(message: string, channelId: string, botName?: string) {
    let chatContext = await this.firebaseService.getChatContext(channelId);
    if (!chatContext || message === "!reset") {
      chatContext = await this.firebaseService.resetChatContext(
        channelId,
        botName
      );
    }

    const gptResponse = await this.openai.chat.completions.create({
      messages: [
        ...chatContext,
        {
          role: "user",
          content: message || "",
        },
      ],

      model: "gpt-3.5-turbo",
    });
    const response = gptResponse.choices[0].message.content;

    const messages: IMessage[] = [
      {
        role: "user",
        content: message || "",
      },
      {
        role: "assistant",
        content: response || "",
      },
    ];

    if (message !== "!reset")
      await this.firebaseService.saveChatContext(channelId, messages);

    return response;
  }
}
