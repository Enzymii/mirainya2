import axios from 'axios';
import type { AxiosInstance } from 'axios';
import Logger from './log';

export default class HttpRequest {
  private instance: AxiosInstance;
  private session: string;

  constructor(baseURL?: string, timeout = 2333) {
    this.instance = axios.create({ baseURL: `http://${baseURL}`, timeout });
    this.session = '';
  }

  public sendRequest = async <T>(
    url: string,
    data?: Record<string, unknown>,
    method: 'GET' | 'POST' = 'GET'
  ): Promise<T> => {
    const reqBody = { ...{ sessionKey: this.session }, ...data };
    try {
      if (method === 'GET') {
        const resp: unknown = (
          await this.instance.get(url, { params: reqBody })
        ).data;
        return resp as T;
      } else {
        const resp: unknown = (
          await this.instance.post(url, JSON.stringify(reqBody))
        ).data;
        return resp as T;
      }
    } catch (err) {
      Logger.log(
        `Error occurred when sending HTTP request: ${err}`,
        Logger.error
      );
      throw err;
    }
  };

  public verify = async (verifyKey: string): Promise<string | null> => {
    interface VerifyResponse {
      code: number;
      session: string;
    }

    try {
      const { code, session } = (await this.sendRequest<VerifyResponse>(
        '/verify',
        { verifyKey },
        'POST'
      )) as VerifyResponse;

      if (code !== 0) {
        Logger.log(`Verify failed with code [${code}]`, Logger.error);
        return null;
      } else {
        Logger.log(`Verify success with sessionKey: ${session}`, Logger.info);
        this.session = session;
        return session;
      }
    } catch (err) {
      this.reportError(err, 'Verify');
      return null;
    }
  };

  public bind = async (qq: number, givenSession?: string): Promise<boolean> => {
    const session = givenSession ?? this.session;

    try {
      const { code, msg } = (await this.sendRequest<MiraiApiResponse>(
        '/bind',
        { sessionKey: session, qq },
        'POST'
      )) as MiraiApiResponse;

      return this.checkResponse({ code, msg }, 'Bind');
    } catch (err) {
      this.reportError(err, 'Bind');
      return false;
    }
  };

  private checkResponse = (
    { code, msg }: MiraiApiResponse,
    text: string
  ): boolean => {
    if (code !== 0) {
      Logger.log(`${text} failed with code [${code}]: ${msg}`);
      return false;
    }
    Logger.log(`${text} success`, Logger.success);
    return true;
  };

  private reportError = (err: unknown, text: string) => {
    Logger.log(`${text} failed due to ${err}`, Logger.error);
  };
}

export interface MiraiApiResponse {
  code: number;
  msg: string;
  data?: unknown;
}
