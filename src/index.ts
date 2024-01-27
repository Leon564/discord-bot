import { Bot } from "./discord";
import { FirebaseService } from "./firebase";

const firebaseService = new FirebaseService();
firebaseService.initializeApp();

const bot = new Bot();
bot.start();
