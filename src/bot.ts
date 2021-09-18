import HttpRequest from './utils/request';
import Logger from './utils/log';
import Api from './api';
import { recvIsMessage } from './types/message';
import { RecvEvents } from './types/event';

import type { MiraiApiResponse } from './utils/request';
import type { RecvMessageChain, RecvType } from './types/message';

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

export interface RecvCallback {
  (recv: RecvType | RecvMessageChain | RecvEvents): void;
}

export default class Bot {
  private qq: number;
  private key: string;
  private baseUrl: string;
  private adapter: AdapterOption;
  private session: HttpRequest;

  private isLogined: boolean;

  private readonly _api: Api;

  constructor(config: BotConfig) {
    const { qq, verifyKey, host, port, adapter, timeout } = config;
    this.qq = qq;
    this.key = verifyKey;
    this.baseUrl = `${host}:${port}`;
    this.adapter = adapter;
    this.session = new HttpRequest(`${this.baseUrl}`, timeout);

    this.isLogined = false;

    this._api = new Api(this.session);
  }

  public get api(): Api | null {
    if (!this.checkLoginStatus) {
      return null;
    }
    return this._api;
  }

  public async initialize(): Promise<void> {
    const isConnected = await this.checkMiraiStatus();
    if (!isConnected) {
      Logger.log('Connection Failed. Aborted.', Logger.critical);
      process.exit(1);
    }
  }

  public async login(): Promise<boolean> {
    return (this.isLogined =
      (await this.session.verify(this.key)) !== null &&
      (await this.session.bind(this.qq)));
  }

  public listen(
    callback: RecvCallback,
    filter: 'msg' | 'events' | 'all' = 'all'
  ): NodeJS.Timer | void {
    interface FetchMessageResponse extends MiraiApiResponse {
      data: RecvType[];
    }

    const reportError = (err: unknown) => {
      Logger.log(`Fetch Message Failed: ${err}`, Logger.error);
    };

    if (!this.checkLoginStatus()) return;

    const listenerTimer = setInterval(async () => {
      try {
        const { code, msg, data } =
          (await this.session.sendRequest<MiraiApiResponse>('/fetchMessage', {
            count: 10,
          })) as FetchMessageResponse;

        if (code !== 0) {
          reportError(`[${code}]${msg}`);
        } else {
          data.forEach((recv) => {
            switch (filter) {
              case 'events':
                if (!recvIsMessage(recv)) {
                  callback(recv as RecvEvents);
                }
                break;
              case 'msg':
                if (recvIsMessage(recv)) {
                  callback(recv as RecvMessageChain);
                }
                break;
              default:
                callback(recv as RecvType);
                break;
            }
          });
        }
      } catch (err) {
        reportError(err);
      }
    }, 2000);

    return listenerTimer;
  }

  private async checkMiraiStatus(): Promise<boolean> {
    try {
      const res = await this.session.sendRequest<MiraiApiResponse>('/about');
      const { code, msg } = res;
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

  private checkLoginStatus(): boolean {
    if (!this.isLogined) {
      Logger.log('Login Required.', Logger.critical);
    }
    return this.isLogined;
  }
}
