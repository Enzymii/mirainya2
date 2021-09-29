import Logger from './log';

type ExceptionNames =
  | 'UnverifiedException'
  | 'HttpException'
  | 'ParamException';

export default class Exception {
  name: ExceptionNames;
  source: string;
  details?: Record<string, unknown>;

  constructor(
    name: ExceptionNames,
    source: string,
    details?: Record<string, unknown>
  ) {
    this.name = name;
    this.source = source;
    this.details = details;
  }

  log(): void {
    Logger.log(
      `Exception '${this.name}' at ${this.source}: ${
        this.details ? JSON.stringify(this.details) : 'No details provided.'
      }`,
      Logger.critical
    );
  }
}
