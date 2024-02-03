import { Message } from 'discord.js';

type MessageP = {
  channel: {
    name?: string;
  };
};

export type MessageWithChannelName = Message & MessageP;
