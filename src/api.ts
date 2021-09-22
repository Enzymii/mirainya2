import HttpRequest from './utils/request';
import Logger from './utils/log';

import type {
  FriendInfo,
  GroupInfo,
  MemberProfile,
  PersonProfile,
} from './types/profile';
import type { MiraiApiResponse } from './utils/request';
import type { MessageChain, RecvMessageChain } from './types/message';
import { TextDecoder } from 'util';

interface SendMessageResponse {
  code: number;
  msg: string;
  messageId: number;
}

interface PostActionResponse {
  code: number;
  msg: string;
}

interface GroupConfig {
  name: string;
  announcement: string;
  confessTalk: boolean;
  allowMemberInvite: boolean;
  autoApprove: boolean;
  anonymousChat: true;
}

export default class Api {
  private session: HttpRequest;

  constructor(session: HttpRequest) {
    this.session = session;
  }

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

  private async postAction(
    path: string,
    params: Record<string, number | string | boolean>,
    actionText?: string
  ): Promise<void> {
    const url = `/${path}`;
    const text = actionText ?? path;
    const { code, msg } = await this.session.sendRequest<PostActionResponse>(
      url,
      params,
      'POST'
    );
    if (code !== 0) {
      this.reportRequestError(code, msg, text);
      throw 'request error';
    }
    Logger.log(`${TextDecoder} success`);
  }

  private reportRequestError(code: number, msg: string, text: string): void {
    Logger.log(`Request error on ${text}: [${code}] ${msg}`, Logger.error);
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
  public getMessageById = async (id: number): Promise<RecvMessageChain> =>
    this.getInfo<RecvMessageChain>('messageFromId', { id });

  public deleteFriend = async (id: number): Promise<void> =>
    this.postAction('deleteFriend', { target: id }, `delete friend ${id}`);

  public muteGroupMember = async (
    groupId: number,
    memberId: number,
    seconds = 1800 // default 30 min
  ): Promise<void> =>
    this.postAction(
      'mute',
      { target: groupId, memberId, time: seconds },
      `mute [${memberId}] in group [${groupId}] for ${seconds}s`
    );
  public mute = this.muteGroupMember; // alias
  public unmuteGroupMember = async (
    groupId: number,
    memberId: number
  ): Promise<void> =>
    this.postAction(
      'unmute',
      { target: groupId, memberId },
      `unmute [${memberId}] in group [${groupId}]`
    );
  public unmute = this.unmuteGroupMember; // alias

  public kickGroupMember = async (
    groupId: number,
    memberId: number,
    msg = ''
  ): Promise<void> =>
    this.postAction(
      'kick',
      { target: groupId, memberId, msg },
      `kick [${memberId}] from group [${groupId}]`
    );
  public kick = this.kickGroupMember; // alias

  public quitGroup = async (groupId: number): Promise<void> =>
    this.postAction('quit', { target: groupId }, `quit group [${groupId}]`);
  public muteAll = async (groupId: number): Promise<void> =>
    this.postAction(
      'muteAll',
      { target: groupId },
      `mute all in group [${groupId}]`
    );
  public unmuteAll = async (groupId: number): Promise<void> =>
    this.postAction(
      'unmuteAll',
      { target: groupId },
      `unmute all in group [${groupId}]`
    );
  public setEssence = async (messageId: number): Promise<void> =>
    this.postAction(
      'setEssence',
      { target: messageId },
      `set message #${messageId} as essence`
    );
  public giveAdmin = async (groupId: number, memberId: number): Promise<void> =>
    this.postAction(
      'memberAdmin',
      {
        target: groupId,
        memberId,
        assign: false,
      },
      `give admin to [${memberId}] in group [${groupId}]`
    );
  public revokeAdmin = async (
    groupId: number,
    memberId: number
  ): Promise<void> =>
    this.postAction(
      'memberAdmin',
      {
        target: groupId,
        memberId,
        assign: false,
      },
      `revoke admin of [${memberId}] in group [${groupId}]`
    );
  public setAdmin = async (
    groupId: number,
    memberId: number,
    status = true
  ): Promise<void> =>
    status
      ? this.giveAdmin(groupId, memberId)
      : this.revokeAdmin(groupId, memberId);

  public getGroupConfig = async (groupId: number): Promise<GroupConfig> => {
    const resp = await this.session.sendRequest<
      GroupConfig | PostActionResponse
    >('/groupConfig', {
      target: groupId,
    });

    const validation = (resp: unknown): resp is GroupConfig =>
      !(resp as PostActionResponse).code;

    if (!validation(resp)) {
      const { code, msg } = resp;
      this.reportRequestError(code, msg, `get group [${groupId}] config`);
      throw 'request error';
    }
    Logger.log(`get group [${groupId}] config ok: ${JSON.stringify(resp)}`);
    return resp;
  };
  public setGroupConfig = async (
    groupId: number,
    config: Partial<GroupConfig>
  ): Promise<void> =>
    this.postAction(
      'groupConfig',
      { target: groupId, ...config },
      `set group [${groupId}] config`
    );
}
