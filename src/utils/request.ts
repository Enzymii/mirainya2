import axios from 'axios';
import type { AxiosInstance } from 'axios';
import chalk from 'chalk';

export default class Requests {
  private instance: AxiosInstance;

  constructor(baseURL?: string, timeout = 2333) {
    this.instance = axios.create({ baseURL: `http://${baseURL}`, timeout });
  }

  httpRequest = async <T>(
    url: string,
    data?: Record<string, any>,
    method: 'GET' | 'POST' = 'GET'
  ): Promise<T | void> => {
    try {
      if (method === 'GET') {
        let resp: unknown = (await this.instance.get(url, { params: data }))
          .data;
        return resp as T;
      } else {
        let resp: unknown = (await this.instance.post(url, { data })).data;
        return resp as T;
      }
    } catch (err) {
      console.log(
        chalk.red(`Error occurred when sending HTTP request: ${err}`)
      );
      throw err;
    }
  };
}
