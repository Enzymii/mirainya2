import chalk from 'chalk';
import Requests from './utils/request';

export type AdapterOption = Partial<{
  http: boolean;
  // TODO: support other adapters such as ws
}>;

export interface BotConfig {
  qq: number;
  verifyKey: string;
  host: string;
  port: number;
  adapter: AdapterOption;
  timeout?: number;
}

export default class Bot {
  qq: number;
  key: string;
  baseUrl: string;
  adapter: AdapterOption;
  session: Requests;

  constructor(config: BotConfig) {
    const { qq, verifyKey, host, port, adapter, timeout } = config;
    this.qq = qq;
    this.key = verifyKey;
    this.baseUrl = `${host}:${port}`;
    this.adapter = adapter;
    this.session = new Requests(`${this.baseUrl}`, timeout);
  }

  async initialize(): Promise<void> {
    try {
      const res = await this.session.httpRequest('/about');
      console.log(res);
    } catch (err) {
      console.log(
        chalk.red.bold('Initialize Failed. The process will exit soon.')
      );
      process.exit(0);
    }
  }
}
