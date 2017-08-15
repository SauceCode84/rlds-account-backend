
import "reflect-metadata";
import { ICommand, COMMAND_HANDLER_METADATA } from "./command-handler";

/**
 * Decorates a `CommandHandler` class to provide metadata for the associated `Command` being handled by the class
 * @param command The Command being handled
 */
export const CommandHandler = (command: ICommand): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
  }
}
