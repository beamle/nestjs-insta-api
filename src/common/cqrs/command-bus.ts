import { Injectable } from '@nestjs/common';
import { Command } from './command';

@Injectable()
export class CommandBus {
  private handlers = new Map<string, any>(); // <commandHandler, CommandType>

  register(handler: any, commandType: string): void {
    this.handlers.set(commandType, handler);
  }

  async execute<R = void>(command: Command): Promise<R> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.type}`);
    }
    return handler.handle(command) as Promise<R>;
  }
}
