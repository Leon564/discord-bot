import { ResponseMessage } from 'src/domain/types/response-message.type';

type Nullable = undefined | null;

export class SendMessageMapper {
  static toSocket(data: ResponseMessage): any {
    switch (data.type) {
      case 'text':
        return data.text;
    }
  }
}
