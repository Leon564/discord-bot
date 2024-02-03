import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ResponseMessage } from 'src/domain/types/response-message.type';
import { MessageCommandService } from '../services/message-command.service';
import { handleOptions } from 'src/domain/types/handle-options.type';

@Controller()
export class AppController {
  constructor(private readonly messageCommandService: MessageCommandService) {}

  @MessagePattern('message')
  onMessage(
    @Payload('data') payload: any,
    @Payload('options') options: handleOptions,
  ): Promise<ResponseMessage> {
    return this.messageCommandService.handle(payload, options);
  }
}
