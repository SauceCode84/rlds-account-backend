
enum IrisEnvironment {
  RUN,
  TEST
}

declare const process;
import * as clc from "cli-color";

export class Logger {

  private static mode = IrisEnvironment.RUN;
  private readonly yellow = clc.xterm(3);

  constructor(private context: string) { }

  public static setMode(mode: IrisEnvironment) {
    this.mode = mode;
  }

  public log(message: string) {
    this.logMessage(message, clc.green);
  }

  private logMessage(message: string, color: (msg: string) => string) {
    if (Logger.mode === IrisEnvironment.TEST) {
      return;
    }

    process.stdout.write(color(`[Iris] ${process.id} - `));
    process.stdout.write(`${new Date(Date.now()).toLocaleString()} `);
    process.stdout.write(this.yellow(`[${this.context}] `));
    process.stdout.write(color(message));
    process.stdout.write(`\n`);
  }

}
