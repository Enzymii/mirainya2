import HttpRequest from './utils/request';
import Logger from './utils/log';

import type {
  FriendInfo,
  GroupInfo,
  MemberProfile,
  PersonProfile,
} from './types/profile';
import type { MiraiApiResponse } from './utils/request';
import type { MessageChain } from './types/message';

interface SendMessageResponse {
  code: number;
  msg: string;
  messageId: number;
}

export default class Api {
  private session: HttpRequest;

  constructor(session: HttpRequest) {
    this.session = session;
  }

  public sendFriendMessage = async (
    friendId: number,
    messageChain: MessageChain,
    quote?: number
  ): Promise<number> =>
    this.sendMessage(
      'sendFriendMessage',
      { target: friendId },
      messageChain,
      quote
    );
  public sendGroupMessage = async (
    groupId: number,
    messageChain: MessageChain,
    quote?: number
  ): Promise<number> =>
    this.sendMessage(
      'sendGroupMessage',
      { target: groupId },
      messageChain,
      quote
    );
  public sendTempMessage = async (
    groupId: number,
    memberId: number,
    messageChain: MessageChain,
    quote?: number
  ): Promise<number> =>
    this.sendMessage(
      'sendTempMessage',
      { group: groupId, qq: memberId },
      messageChain,
      quote
    );

  // 戳一戳
  public sendNudge = async (
    qq: number,
    type: 'Friend' | 'Group' | 'Stranger',
    positionId: number
  ): Promise<void> => {
    const { code, msg } = await this.session.sendRequest<MiraiApiResponse>(
      '/sendNudge',
      { target: qq, subject: positionId, kind: type },
      'POST'
    );

    if (code !== 0) {
      this.reportRequestError(code, msg, 'send Nudge');
      throw 'request error';
    }
    Logger.log('send Nudge success');
  };

  public recallMessage = async (messageId: number): Promise<void> => {
    const { code, msg } = await this.session.sendRequest<MiraiApiResponse>(
      '/recall',
      { target: messageId },
      'POST'
    );

    if (code !== 0) {
      this.reportRequestError(code, msg, 'recall message');
      throw 'recall error';
    }
    Logger.log(`recall message[${messageId}] success`);
  };

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

  private async sendMessage(
    callerName: string,
    target: Record<string, number>,
    messageChain: MessageChain,
    quote?: number
  ): Promise<number> {
    const url = `/${callerName}`;
    const { code, msg, messageId } =
      await this.session.sendRequest<SendMessageResponse>(
        url,
        { ...target, quote, messageChain },
        'POST'
      );

    if (code !== 0) {
      this.reportRequestError(code, msg, callerName);
      throw 'request error';
    }
    Logger.log(`${callerName} success with id [${messageId}]`);
    return messageId;
  }

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
