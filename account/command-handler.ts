
import { Type } from "./type";

export const COMMAND_HANDLER_METADATA = "__commandHandler__";

export interface ICommand { }

export interface ICommandHandler<TCommand extends ICommand> {
  execute(command: TCommand, resolve: (value?) => void);
}

export type CommandHandlerType = Type<ICommandHandler<ICommand>>;

export interface ICommandHandlerProvider {
  provide: any;
  useFactory: Function;
}
