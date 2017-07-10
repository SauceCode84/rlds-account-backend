
const InvalidModuleConfigMessage = (property: string) => `Invalid property ${property} in @Module() decorator`;

export class InvalidModuleConfigException extends Error {
  
  constructor(property: string) {
    super(InvalidModuleConfigMessage(property));
  }

}
