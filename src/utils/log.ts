import chalk from 'chalk';
import dateFormat from 'dateformat';
import type { Chalk } from 'chalk';

export default class Logger {
  static readonly text = chalk.white;
  static readonly info = chalk.cyanBright;
  static readonly success = chalk.green;
  static readonly warn = chalk.yellow;
  static readonly error = chalk.red;
  static readonly critical = chalk.red.bold;

  static log(msg: string, chalk: Chalk = this.text): void {
    const dateFmt = dateFormat(new Date(), 'yy/mm/dd HH:MM:ss');
    console.log(chalk(`[${dateFmt}] ${msg}`));
  }
}
