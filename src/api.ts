import HttpRequest from './utils/request';
import Logger from './utils/log';

import type {
  FriendInfo,
  GroupInfo,
  MemberProfile,
  Permission,
  PersonProfile,
} from './types/profile';
import type { MiraiApiResponse } from './utils/request';
import type { MessageChain, RecvMessageChain } from './types/message';
import { TextDecoder } from 'util';
import {
  BotInvitedJoinGroupRequestEvent,
  MemberJoinRequestEvent,
  NewFriendRequestEvent,
} from './types/event';
import Exception from './utils/exception';

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

interface MemberConfig {
  id: number;
  memberName: string; // 群名片
  specialTitle: string; // 群头衔
  permission: Permission;
  joinTimestamp: number;
  lastSpeakTimeStamp: number;
  muteTimeRemaining: number;
  group: GroupInfo;
}

export type ApiValue<T> = T extends void
  ?
      | { flag: true; result: undefined; exception: undefined }
      | { flag: false; result: undefined; exception: Exception }
  :
      | { flag: true; result: T; exception: undefined }
      | { flag: false; result: undefined; exception: Exception };

type FriendRequestOptions = 'accept' | 'refuse' | 'refuseForever' | 0 | 1 | 2;
type MemberJoinRequestOptions =
  | 'accept'
  | 'refuse'
  | 'ignore'
  | 'refuseForever'
  | 'ignoreForever'
  | 0
  | 1
  | 2
  | 3
  | 4;
type InviteRequestOptions = 'accept' | 'refuse' | boolean | 0 | 1;

const UndefinedResult = { result: undefined };
const UndefinedException = { exception: undefined };

export default class Api {
  private _session?: HttpRequest;

  constructor() {
    this._session = undefined;
  }

  public async activate(
    session: HttpRequest,
    key: string,
    qq: number
  ): Promise<ApiValue<void>> {
    try {
      this._session = session;
      const verified = await this._session.verify(key);
      if (!verified) {
        throw new Exception('UnverifiedException', 'bot.api.verify');
      }
      const bound = await this._session.bind(qq);
      if (!bound) {
        throw new Exception('UnverifiedException', 'bot.api.bind');
      }
      return { flag: true, ...UndefinedResult, ...UndefinedException };
    } catch (e) {
      const exception = e as Exception;
      exception.log();
      return { flag: false, ...UndefinedResult, exception };
    }
  }

  public get session(): boolean {
    return this._session !== undefined;
  }

  private checkApiAvailability(): void {
    if (!this._session) {
      throw new Exception('UnverifiedException', 'bot.api', {});
    }
  }

  private async sendMessage(
    callerName: string,
    target: Record<string, number>,
    messageChain: MessageChain,
    quote?: number,
    text?: string
  ): Promise<ApiValue<number>> {
    try {
      this.checkApiAvailability();
      const src = text ?? callerName;
      const url = `/${callerName}`;
      const { code, msg, messageId } =
        (await this._session?.sendRequest<SendMessageResponse>(
          url,
          { ...target, quote, messageChain },
          'POST'
        )) as SendMessageResponse;

      if (code !== 0) {
        this.reportRequestError(code, msg, src);
      }
      Logger.log(`${callerName} success with id [${messageId}]`);
      return { flag: true, result: messageId, ...UndefinedException };
    } catch (e) {
      const exception = e as Exception;
      exception.log();
      return { flag: false, ...UndefinedResult, exception };
    }
  }

  private async getInfo<T>(
    callerName: string,
    text?: string,
    params?: Record<string, unknown>
  ): Promise<ApiValue<T>> {
    interface FriendListResponse extends MiraiApiResponse {
      data: T;
    }

    try {
      const url = `/${callerName}`;
      const src = text ?? `get ${callerName}`;

      const { code, msg, data } =
        (await this._session?.sendRequest<MiraiApiResponse>(
          url,
          params
        )) as FriendListResponse;

      if (code !== 0) {
        this.reportRequestError(code, msg, src);
      }

      Logger.log(`${src} success`, Logger.text);
      return {
        flag: true,
        result: data as T,
        ...UndefinedException,
      } as ApiValue<T>;
    } catch (e) {
      const exception = e as Exception;
      exception.log();
      return { flag: false, ...UndefinedResult, exception };
    }
  }

  private async postAction(
    path: string,
    params: Record<string, unknown>,
    actionText?: string
  ): Promise<ApiValue<void>> {
    try {
      const url = `/${path}`;
      const text = actionText ?? path;
      const { code, msg } =
        (await this._session?.sendRequest<PostActionResponse>(
          url,
          params,
          'POST'
        )) as PostActionResponse;
      if (code !== 0) {
        this.reportRequestError(code, msg, text);
      }
      Logger.log(`${TextDecoder} success`, Logger.text);
      return { flag: true, ...UndefinedResult, ...UndefinedException };
    } catch (e) {
      const exception = e as Exception;
      exception.log();
      return { flag: false, ...UndefinedResult, exception };
    }
  }

  private async handleEvent(
    path: string,
    eventId: number,
    params?: Record<string, number>,
    message?: string
  ): Promise<ApiValue<void>> {
    try {
      const { code, msg } =
        (await this._session?.sendRequest<PostActionResponse>(
          `/resp/${path}Event`,
          {
            eventId,
            ...params,
            message,
          },
          'POST'
        )) as PostActionResponse;

      const src = `response to event [${eventId}]`;

      if (code !== 0) {
        this.reportRequestError(code, msg, src);
      }
      Logger.log(`${src} success`, Logger.text);
      return { flag: true, ...UndefinedResult, ...UndefinedException };
    } catch (e) {
      const exception = e as Exception;
      exception.log();
      return { flag: false, ...UndefinedResult, exception };
    }
  }

  private reportRequestError(code: number, msg: string, src: string): never {
    throw new Exception('HttpException', src, { code, msg });
  }

  public sendFriendMessage = async (
    friendId: number,
    messageChain: MessageChain,
    quote?: number
  ): Promise<ApiValue<number>> =>
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
  ): Promise<ApiValue<number>> =>
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
  ): Promise<ApiValue<number>> =>
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
    positionId?: number
  ): Promise<ApiValue<void>> => {
    try {
      const { code, msg } = (await this._session?.sendRequest<MiraiApiResponse>(
        '/sendNudge',
        { target: qq, subject: positionId ?? qq, kind: type },
        'POST'
      )) as MiraiApiResponse;

      if (code !== 0) {
        this.reportRequestError(code, msg, 'send Nudge');
      }
      Logger.log('send Nudge success');
      return { flag: true, ...UndefinedResult, ...UndefinedException };
    } catch (e) {
      const exception = e as Exception;
      exception.log();
      return { flag: false, ...UndefinedResult, exception };
    }
  };

  public recallMessage = async (messageId: number): Promise<ApiValue<void>> => {
    try {
      const { code, msg } = (await this._session?.sendRequest<MiraiApiResponse>(
        '/recall',
        { target: messageId },
        'POST'
      )) as MiraiApiResponse;

      if (code !== 0) {
        this.reportRequestError(code, msg, `recall message #${messageId}`);
      }
      Logger.log(`recall message[${messageId}] success`);
      return { flag: true, ...UndefinedResult, ...UndefinedException };
    } catch (e) {
      const exception = e as Exception;
      exception.log();
      return { flag: false, ...UndefinedResult, exception };
    }
  };

  public getFriendList = async (): Promise<ApiValue<FriendInfo[]>> =>
    this.getInfo<FriendInfo[]>('friendList', 'get friend list');
  public getGroupList = async (): Promise<ApiValue<GroupInfo[]>> =>
    this.getInfo<GroupInfo[]>('groupList', 'get group list');
  public getMemberList = async (
    groupId: number
  ): Promise<ApiValue<MemberProfile[]>> =>
    this.getInfo<MemberProfile[]>(
      'memberList',
      `get member list of group [${groupId}]`,
      { target: groupId }
    );
  public getBotProfile = async (): Promise<ApiValue<PersonProfile>> =>
    this.getInfo<PersonProfile>('botProfile', 'get bot profile');
  public getFriendProfile = async (
    qq: number
  ): Promise<ApiValue<PersonProfile>> =>
    this.getInfo<PersonProfile>('friendProfile', `get [${qq}]'s profile`);
  public getMemberProfile = async (
    groupId: number,
    memberId: number
  ): Promise<ApiValue<PersonProfile>> =>
    this.getInfo<PersonProfile>(
      'memberProfile',
      `get [${memberId}] in group [${groupId}]'s profile`,
      { target: groupId, memberId }
    );
  public getMessageById = async (
    id: number
  ): Promise<ApiValue<RecvMessageChain>> =>
    this.getInfo<RecvMessageChain>('messageFromId', `get message #${id}`, {
      id,
    });

  public deleteFriend = async (id: number): Promise<ApiValue<void>> =>
    this.postAction('deleteFriend', { target: id }, `delete friend ${id}`);

  public muteGroupMember = async (
    groupId: number,
    memberId: number,
    seconds = 1800 // default 30 min
  ): Promise<ApiValue<void>> =>
    this.postAction(
      'mute',
      { target: groupId, memberId, time: seconds },
      `mute [${memberId}] in group [${groupId}] for ${seconds}s`
    );
  public mute = this.muteGroupMember; // alias
  public unmuteGroupMember = async (
    groupId: number,
    memberId: number
  ): Promise<ApiValue<void>> =>
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
  ): Promise<ApiValue<void>> =>
    this.postAction(
      'kick',
      { target: groupId, memberId, msg },
      `kick [${memberId}] from group [${groupId}]`
    );
  public kick = this.kickGroupMember; // alias

  public quitGroup = async (groupId: number): Promise<ApiValue<void>> =>
    this.postAction('quit', { target: groupId }, `quit group [${groupId}]`);
  public muteAll = async (groupId: number): Promise<ApiValue<void>> =>
    this.postAction(
      'muteAll',
      { target: groupId },
      `mute all in group [${groupId}]`
    );
  public unmuteAll = async (groupId: number): Promise<ApiValue<void>> =>
    this.postAction(
      'unmuteAll',
      { target: groupId },
      `unmute all in group [${groupId}]`
    );
  public setEssence = async (messageId: number): Promise<ApiValue<void>> =>
    this.postAction(
      'setEssence',
      { target: messageId },
      `set message #${messageId} as essence`
    );
  public giveAdmin = async (
    groupId: number,
    memberId: number
  ): Promise<ApiValue<void>> =>
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
  ): Promise<ApiValue<void>> =>
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
  ): Promise<ApiValue<void>> =>
    status
      ? this.giveAdmin(groupId, memberId)
      : this.revokeAdmin(groupId, memberId);

  public getGroupConfig = async (
    groupId: number
  ): Promise<ApiValue<GroupConfig>> => {
    try {
      type RespType = GroupConfig | PostActionResponse;

      const resp = (await this._session?.sendRequest<RespType>('/groupConfig', {
        target: groupId,
      })) as RespType;

      const validation = (resp: unknown): resp is GroupConfig =>
        !(resp as PostActionResponse).code;

      if (!validation(resp)) {
        const { code, msg } = resp;
        this.reportRequestError(code, msg, `get group [${groupId}] config`);
      }
      Logger.log(`get group [${groupId}] config ok: ${JSON.stringify(resp)}`);
      return { flag: true, result: resp, ...UndefinedException };
    } catch (e) {
      const exception = e as Exception;
      exception.log();
      return { flag: false, ...UndefinedResult, exception };
    }
  };
  public setGroupConfig = async (
    groupId: number,
    config: Partial<GroupConfig>
  ): Promise<ApiValue<void>> =>
    this.postAction(
      'groupConfig',
      { target: groupId, ...config },
      `set group [${groupId}] config`
    );

  public getMemberConfig = async (
    groupId: number,
    memberId: number
  ): Promise<ApiValue<MemberConfig>> => {
    try {
      type RespType = MemberConfig | PostActionResponse;

      const resp = (await this._session?.sendRequest<RespType>('/memberInfo', {
        target: groupId,
        memberId,
      })) as RespType;

      const validation = (resp: unknown): resp is MemberConfig =>
        !(resp as PostActionResponse).code;

      if (!validation(resp)) {
        const { code, msg } = resp;
        this.reportRequestError(
          code,
          msg,
          `get [${memberId}] config in group [${groupId}]`
        );
      }
      Logger.log(
        `get [${memberId}] config in group [${groupId}] ok: ${JSON.stringify(
          resp
        )}`
      );
      return { flag: true, result: resp, ...UndefinedException };
    } catch (e) {
      const exception = e as Exception;
      exception.log();
      return { flag: false, ...UndefinedResult, exception };
    }
  };
  public setMemberConfig = async (
    groupId: number,
    memberId: number,
    newConfig: Partial<{ name: string; specialTitle: string }>
  ): Promise<ApiValue<void>> =>
    this.postAction('/memberInfo', {
      target: groupId,
      memberId,
      info: newConfig,
    });

  private readonly friendRequestOperation = [
    'accept',
    'refuse',
    'refuseForever',
  ];
  private readonly memberJoinRequestOperation = [
    'accept',
    'refuse',
    'ignore',
    'refuseForever',
    'ignoreForever',
  ];

  public handleFriendRequest = async (
    eventId: number,
    qq: number,
    operate: FriendRequestOptions,
    groupId = 0,
    message = ''
  ): Promise<ApiValue<void>> =>
    this.handleEvent(
      'newFriendRequest',
      eventId,
      {
        fromId: qq,
        groupId,
        operate:
          typeof operate === 'number'
            ? operate
            : this.friendRequestOperation.indexOf(operate),
      },
      message
    );

  public handleFriendRequestDirect = async (
    { eventId, fromId, groupId }: NewFriendRequestEvent,
    operate: FriendRequestOptions,
    message = ''
  ): Promise<ApiValue<void>> =>
    this.handleFriendRequest(eventId, fromId, operate, groupId, message);

  public handleMemberJoinRequest = async (
    eventId: number,
    groupId: number,
    memberId: number,
    operate: MemberJoinRequestOptions,
    message = ''
  ): Promise<ApiValue<void>> =>
    this.handleEvent(
      'memberJoinRequest',
      eventId,
      {
        fromId: memberId,
        groupId,
        operate:
          typeof operate === 'number'
            ? operate
            : this.memberJoinRequestOperation.indexOf(operate),
      },
      message
    );

  public handleMemberJoinRequestDirect = async (
    { eventId, fromId, groupId }: MemberJoinRequestEvent,
    operate: MemberJoinRequestOptions,
    message = ''
  ): Promise<ApiValue<void>> =>
    this.handleMemberJoinRequest(eventId, groupId, fromId, operate, message);

  public handleInviteRequest = async (
    eventId: number,
    inviter: number,
    groupId: number,
    operate: InviteRequestOptions,
    message = ''
  ): Promise<ApiValue<void>> =>
    this.handleEvent(
      'botInvitedJoinGroupRequest',
      eventId,
      {
        fromId: inviter,
        groupId,
        operate:
          operate === 'accept' || operate === true || operate === 0 ? 0 : 1,
      },
      message
    );
  public handleInviteRequestDirect = async (
    { eventId, fromId, groupId }: BotInvitedJoinGroupRequestEvent,
    operate: InviteRequestOptions,
    message = ''
  ): Promise<ApiValue<void>> =>
    this.handleInviteRequest(eventId, fromId, groupId, operate, message);

  // file operations, multimedia upload and command operations are not implemented yet
}
