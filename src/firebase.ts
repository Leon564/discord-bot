import * as admin from "firebase-admin";
import "dotenv/config";
import { ServiceAccount } from "firebase-admin";
import { Database, Reference } from "firebase-admin/database";
import firebaseConfigs from "./configs/firebase.configs";

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export class FirebaseService {
  private database: Database;
  private chatContext: Reference;

  initializeApp() {
    const adminConfig: ServiceAccount = {
      projectId: firebaseConfigs.projectId,
      privateKey: firebaseConfigs.privateKey.replace(/\\n/g, "\n"),
      clientEmail: firebaseConfigs.clientEmail,
    };

    admin.initializeApp({
      credential: admin.credential.cert(adminConfig),
      databaseURL: firebaseConfigs.dataBaseUrl,
    });
  }

  init() {
    this.database = admin.database();
    this.chatContext = this.database.ref("chatContext");
  }

  saveChatContext(channelId: string, messages: IMessage[]): Promise<any> {
    this.init();
    //push messages to chat context
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
      .once("value")
      .then((snapshot) => {
        const result = snapshot.val();
        if (result && !Array.isArray(result)) {
          return Object.values(result);
        }
        return result;
      });
  }

  resetChatContext(channelId: string, botName?: string): Promise<IMessage[]> {
    this.init();
    const initialMessages: IMessage[] = [
      botName
        ? {
            role: "system",
            content: `te llamas ${botName} y eres un asistente de estudio `,
          }
        : {
            role: "system",
            content: "sabes todo sobre anime",
          },
      {
        role: "system",
        content: `cuando el usuario dice que '!reset' se resetea la conversación`,
      },
      {
        role: "system",
        content: "responde de la manera mas puntual y corta posible",
      },
      {
        role: "system",
        content:
          "eres un asistente de estudio y tratas de ser lo mas preciso posible",
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
