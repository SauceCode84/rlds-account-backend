
export class StatusError extends Error {

  constructor(public statusCode: number, message: string) {
    super(message);

    Object.setPrototypeOf(this, StatusError.prototype);
  }

}
