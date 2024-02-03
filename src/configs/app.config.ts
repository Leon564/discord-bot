import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT) || 3001,
  discordToken: process.env.DISCORD_TOKEN,
  openAiApiKey: process.env.OPENAI_API_KEY,
}));
