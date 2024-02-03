import { MessageResponseType } from '../enums/message-response-type.enum';

export type ResponseMessage = {
  type: MessageResponseType;
  text?: string;
  media?: Buffer;
  isReply?: boolean;
};
