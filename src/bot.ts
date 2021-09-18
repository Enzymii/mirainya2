import chalk from 'chalk';
import HttpRequest from './utils/request';
import type { MiraiApiResponse } from './utils/request';
import Logger from './utils/log';

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
  session: HttpRequest;

  constructor(config: BotConfig) {
    const { qq, verifyKey, host, port, adapter, timeout } = config;
    this.qq = qq;
    this.key = verifyKey;
    this.baseUrl = `${host}:${port}`;
    this.adapter = adapter;
    this.session = new HttpRequest(`${this.baseUrl}`, timeout);
  }

  async initialize(): Promise<void> {
    const isConnected = await this.checkMiraiStatus();
    if (!isConnected) {
      Logger.log('Connection Failed. Aborted.', Logger.critical);
      process.exit(1);
    }

    const login =
      (await this.session.verify(this.key)) !== null &&
      (await this.session.bind(this.qq));
    if (!login) {
      Logger.log('Login Failed. Aborted.', Logger.critical);
      process.exit(0);
    }
  }

  async checkMiraiStatus(): Promise<boolean> {
    try {
      const res = await this.session.sendRequest<MiraiApiResponse>('/about');
      const { code, msg } = res as MiraiApiResponse;
      if (code === 0) {
        Logger.log('Checking connection to server: passed', Logger.success);
        return true;
      } else {
        Logger.log(
          `Checking connection to server: [${code}: ${msg}]`,
          Logger.warn
        );
        return false;
      }
    } catch (err) {
      Logger.log('Checking connection to server: failed', Logger.error);
      return false;
    }
  }
}
