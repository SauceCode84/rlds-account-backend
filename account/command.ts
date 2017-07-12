import "reflect-metadata";
import { StudentAccount, StudentGrade } from "./account";
//import { ObservableBus } from "../common/cqrs/observable-bus";

const COMMAND_HANDLER_METADATA = "__commandHandler__";

/**
 * Decorates a CommandHandler class to provide metadata for the associated Command being handled by the class
 * @param command The Command being handled
 */
const CommandHandler = (command: Command): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
  }
}

interface Command { }

interface CommandHandler<TCommand extends Command> {
  execute(command: TCommand, resolve: (value?) => void);
}

interface CommandDispatcher {
  execute<TCommand extends Command>(command: TCommand);
}

class CreateStudentCommand implements Command {
  
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly grade: string) { }

}

@CommandHandler(CreateStudentCommand)
class CreateStudentCommandHandler implements CommandHandler<CreateStudentCommand> {
  
  async execute(command: CreateStudentCommand, resolve: <T>(value?: T) => void) {
    let { firstName, lastName, grade } = command;

    // do validation
    // ...
    let newStudentAccount = await StudentAccount.create(firstName, lastName, <StudentGrade>grade);

    students[newStudentAccount.id] = newStudentAccount;
    
    resolve(newStudentAccount.id);
  }

}

const students = {};

class DeactivateStudentCommand implements Command {

  constructor(public readonly id: string) { }

}

@CommandHandler(DeactivateStudentCommand)
class DeactivateStudentCommandHandler implements CommandHandler<DeactivateStudentCommand> {
  
  async execute(command: DeactivateStudentCommand, resolve: (value?: any) => void) {
    let student: StudentAccount = students[command.id];
    await student.deactivate();

    resolve();
  }

}

interface Type<T> extends Function {
  new (...args: any[]): T;
}

interface CommandHandlerProvider {
  provide: any;
  useFactory: Function;
}

function isProvider(obj): obj is CommandHandlerProvider {
  return "provide" in obj && "useFactory" in obj;
}

const CommandHandlers: (CommandHandlerType | CommandHandlerProvider)[] = [
  CreateStudentCommandHandler,
  {
    provide: DeactivateStudentCommandHandler,
    useFactory: (): DeactivateStudentCommandHandler => {
      return new DeactivateStudentCommandHandler();
    }
  }
];

type CommandHandlerType = Type<CommandHandler<Command>>;

class CommandBus {

  private handlers = new Map<string, CommandHandler<Command>>();

  public execute<TCommand extends Command>(command: TCommand): Promise<any> {
    const commandName = this.getCommandName(command);
    const handler = this.handlers.get(commandName);
    
    if (!handler) {
      throw new Error();
    }

    //this.subject.next(command);

    return new Promise((resolve) => {
      handler.execute(command, resolve);
    });
  }

  public register(handlers: (CommandHandlerType | CommandHandlerProvider)[]) {
    handlers.forEach(handler => this.registerHandler(handler));
  }

  protected registerHandler(handlerOrProvider: CommandHandlerType | CommandHandlerProvider) {
    let instance: CommandHandler<Command>;
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

  public bind<TCommand extends Command>(handler: CommandHandler<TCommand>, name: string) {
    this.handlers.set(name, handler);
  }

  private getCommandName(command: Command): string {
    const { constructor } = Object.getPrototypeOf(command);
    return constructor.name as string;
  }

  private reflectCommandName(handler: CommandHandlerType): FunctionConstructor {
    return Reflect.getMetadata(COMMAND_HANDLER_METADATA, handler);
  }

}

class Service {

  constructor(private commandBus: CommandBus) {
  }

  public async createStudent(firstName, lastName, grade) {
    return await this.commandBus.execute(
      new CreateStudentCommand(firstName, lastName, grade)
    );
  }

  public async deactivateStudent(id) {
    return await this.commandBus.execute(
      new DeactivateStudentCommand(id)
    );
  }

}

async function run() {
  console.log("creating CommandBus...");
  const commandBus = new CommandBus();

  console.log("creating Service...");
  const service = new Service(commandBus);
  
  commandBus.register(CommandHandlers);

  try {
    let id = await service.createStudent("Jim", "Bob", "Grade 1");
    console.log(id);

    await service.deactivateStudent(id);
  } catch (err) {
    console.error(err);
  }
}

run();

/*interface AddEmail {
  id: string;
  email: string;
}

interface Deactivate {
  id: string;
}

type StudentAccountCommand = CreateStudent | AddEmail | Deactivate;

type StudentAccountCommandHandler = (command: StudentAccountCommand) => void;

const studentAccountCommandHandlers: { [commandName: string]: StudentAccountCommandHandler } = {

  create: (command: CreateStudent) => {

  }

}

const handleCommand = (commandName: string, command: StudentAccountCommand) => {
  let commandHandler = studentAccountCommandHandlers[commandName];
  commandHandler(command);
}*/




