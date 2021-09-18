import HttpRequest from './utils/request';
import Logger from './utils/log';

import type {
  FriendInfo,
  GroupInfo,
  MemberProfile,
  PersonProfile,
} from './types/profile';
import type { MiraiApiResponse } from './utils/request';

export default class Api {
  private session: HttpRequest;

  constructor(session: HttpRequest) {
    this.session = session;
  }

  public getFriendList = async (): Promise<FriendInfo[]> =>
    this.getInfo<FriendInfo[]>('friendList');
  public getGroupList = async (): Promise<GroupInfo[]> =>
    this.getInfo<GroupInfo[]>('groupList');
  public getMemberList = async (groupId: number): Promise<MemberProfile[]> =>
    this.getInfo<MemberProfile[]>('memberList', { target: groupId });
  public getBotProfile = async (): Promise<PersonProfile> =>
    this.getInfo<PersonProfile>('botProfile');
  public getFriendProfile = async (): Promise<PersonProfile> =>
    this.getInfo<PersonProfile>('friendProfile');
  public getMemberProfile = async (
    groupId: number,
    memberId: number
  ): Promise<PersonProfile> =>
    this.getInfo<PersonProfile>('memberProfile', { target: groupId, memberId });

  private async getInfo<T>(
    callerName: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    interface FriendListResponse extends MiraiApiResponse {
      data: T;
    }

    const url = `/${callerName}`;

    const { code, msg, data } =
      (await this.session.sendRequest<MiraiApiResponse>(
        url,
        params
      )) as FriendListResponse;

    if (code !== 0) {
      this.reportRequestError(code, msg, `get ${callerName}`);
      throw 'request error';
    }

    Logger.log(`Get ${callerName} success`, Logger.text);
    return data;
  }

  private reportRequestError(code: number, msg: string, text: string): void {
    Logger.log(`Request error on ${text}: [${code}] ${msg}`, Logger.error);
  }
}
