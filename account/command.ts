import "reflect-metadata";
import { StudentAccount, StudentGrade } from "./account";
import { ObservableBus } from "./observable-bus";
import { ICommand, CommandHandlerType, ICommandHandlerProvider, ICommandHandler } from "./command-handler";
import { CommandHandler } from "./command-handler.decorator";
import { CommandBus } from "./command-bus";


/*interface CommandDispatcher {
  execute<TCommand extends Command>(command: TCommand);
}*/

class CreateStudentCommand implements ICommand {
  
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly grade: string) { }

}

@CommandHandler(CreateStudentCommand)
class CreateStudentCommandHandler implements ICommandHandler<CreateStudentCommand> {
  
  async execute(command: CreateStudentCommand, resolve: <T>(value?: T) => void) {
    let { firstName, lastName, grade } = command;

    // do validation
    // ...
    try {
      let newStudentAccount = await StudentAccount.create(firstName, lastName, <StudentGrade>grade);

      students[newStudentAccount.id] = newStudentAccount;
    
      resolve(newStudentAccount.id);
    } catch (err) {
      console.error(err);
    }
  }

}

const students = {};

class DeactivateStudentCommand implements ICommand {

  constructor(public readonly id: string) { }

}

@CommandHandler(DeactivateStudentCommand)
class DeactivateStudentCommandHandler implements ICommandHandler<DeactivateStudentCommand> {
  
  async execute(command: DeactivateStudentCommand, resolve: (value?: any) => void) {
    let student: StudentAccount = students[command.id];
    await student.deactivate();

    resolve();
  }

}

const CommandHandlers: (CommandHandlerType | ICommandHandlerProvider)[] = [
  CreateStudentCommandHandler,
  {
    provide: DeactivateStudentCommandHandler,
    useFactory: (): DeactivateStudentCommandHandler => {
      return new DeactivateStudentCommandHandler();
    }
  }
];





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




