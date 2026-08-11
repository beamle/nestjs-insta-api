import { Command } from './command';

export abstract class CommandHandler<C extends Command = Command, R = void> {
  abstract handle(command: C): Promise<R>;
}
