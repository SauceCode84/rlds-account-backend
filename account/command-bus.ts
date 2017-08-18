
import { ICommand, ICommandHandler, CommandHandlerType, ICommandHandlerProvider, COMMAND_HANDLER_METADATA } from "./command-handler";
import { ObservableBus } from "./observable-bus";

const isProvider = (obj): obj is ICommandHandlerProvider => {
  return "provide" in obj && "useFactory" in obj;
}

export interface ICommandBus {
  execute<TCommand extends ICommand>(command: TCommand): Promise<any>;
}

export class CommandBus extends ObservableBus<ICommand> implements ICommandBus {

  private handlers = new Map<string, ICommandHandler<ICommand>>();

  public execute<TCommand extends ICommand>(command: TCommand): Promise<any> {
    const commandName = this.getCommandName(command);
    const handler = this.handlers.get(commandName);
    
    if (!handler) {
      throw new Error();
    }

    this.subject.next(command);
    
    return new Promise((resolve) => {
      handler.execute(command, resolve);
    });
  }

  public register(handlers: (CommandHandlerType | ICommandHandlerProvider)[]) {
    handlers.forEach(handler => this.registerHandler(handler));
  }

  protected registerHandler(handlerOrProvider: CommandHandlerType | ICommandHandlerProvider) {
    let instance: ICommandHandler<ICommand>;
    let target: FunctionConstructor;

    if (isProvider(handlerOrProvider)) {
      instance = handlerOrProvider.useFactory();
      target = this.reflectCommandName(handlerOrProvider.provide);
    } else {
      // create an instance... this needs to change to cater for DI
      instance = new handlerOrProvider();
      target = this.reflectCommandName(handlerOrProvider);
    }
    
    if (!target) {
      throw new Error();
    }

    this.bind(instance, target.name);
  }

  public bind<TCommand extends ICommand>(handler: ICommandHandler<TCommand>, name: string) {
    this.handlers.set(name, handler);
  }

  private getCommandName(command: ICommand): string {
    const { constructor } = Object.getPrototypeOf(command);
    return constructor.name as string;
  }

  private reflectCommandName(handler: CommandHandlerType): FunctionConstructor {
    return Reflect.getMetadata(COMMAND_HANDLER_METADATA, handler);
  }

}
