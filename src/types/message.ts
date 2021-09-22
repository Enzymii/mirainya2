import type { RecvEvents } from './event';
import type { FriendInfo, MemberProfile } from './profile';
import { RequireAtLeastOne } from './utils';

export type RecvType = RecvMessageChain | RecvEvents;

const recvIsMessage = (recv: RecvType): recv is RecvMessageChain => {
  return recv.type.indexOf('Message') != -1;
};
export { recvIsMessage };

export type Message =
  | AtMessage
  | AppMessage
  | XmlMessage
  | DiceMessage
  | FaceMessage
  | FileMessage
  | JsonMessage
  | PokeMessage
  | AtAllMessage
  | ImageMessage
  | PlainMessage
  | QuoteMessage
  | VoiceMessage
  | SourceMessage
  | ForwardMessage
  | MiraiCodeMessage
  | FlashImageMessage
  | MusicShareMessage;
export type MessageChain = Message[];

interface PeopleMessageChain {
  sender: FriendInfo;
  messageChain: MessageChain;
}

export interface FriendMessageChain extends PeopleMessageChain {
  type: 'FriendMessage';
}

export interface StrangerMessageChain extends PeopleMessageChain {
  type: 'StrangerMessage';
}

interface GroupInnerMessageChain {
  sender: MemberProfile;
  messageChain: MessageChain;
}

export interface GroupMessageChain extends GroupInnerMessageChain {
  type: 'GroupMessage';
}

export interface TempMessageChain extends GroupInnerMessageChain {
  type: 'TempMessage';
}

export interface OtherClientMessageChain {
  type: 'OtherClientMessage';
  sender: {
    id: number;
    platform: string;
  };
  messageChain: MessageChain;
}

export type RecvMessageChain =
  | FriendMessageChain
  | StrangerMessageChain
  | GroupMessageChain
  | TempMessageChain
  | OtherClientMessageChain;

export interface SourceMessage {
  type: 'Source';
  id: number;
  time: number;
}

export interface QuoteMessage {
  type: 'Quote';
  id: number; // 原消息id
  groupId: number;
  senderId: number;
  targetId: number;
  origin: MessageChain;
}

export interface AtMessage {
  type: 'At';
  target: number;
  display?: string;
}

export interface AtAllMessage {
  type: 'AtAll';
}

export interface FaceMessage {
  type: 'Face';
  faceId: number;
  name: string;
}

export interface PlainMessage {
  type: 'Plain';
  text: string;
}

type PicMessage<T extends string> = RequireAtLeastOne<
  {
    type: T;
    imageId: string;
    url: string;
    path: string;
    base64?: string;
  },
  'imageId' | 'url' | 'path' | 'base64'
>;

export type ImageMessage = PicMessage<'Image'>;

export type FlashImageMessage = PicMessage<'FlashImage'>;

export type VoiceMessage = RequireAtLeastOne<
  {
    type: 'Voice';
    voiceId: string;
    url: string;
    path: string;
    base64?: string;
    length?: number;
  },
  'voiceId' | 'url' | 'path' | 'base64'
>;

export interface XmlMessage {
  type: 'Xml';
  xml: string;
}

export interface JsonMessage {
  type: 'Json';
  json: string;
}

export interface AppMessage {
  type: 'App';
  content: string;
}

export type PokeType =
  | 'Poke'
  | 'ShowLove'
  | 'Like'
  | 'Heartbroken'
  | 'SixSixSix'
  | 'FangDaZhao';

export interface PokeMessage {
  type: 'Poke';
  name: PokeType;
}

export interface DiceMessage {
  type: 'Dice';
  value?: number;
}

export interface MusicShareMessage {
  type: 'MusicShare';
  kind: string;
  title: string;
  summary: string;
  jumpUrl: string;
  pictureUrl: string;
  musicUrl: string;
  brief: string;
}

interface ForwardNode {
  senderId: number;
  time: number;
  senderName: string;
  messageChain: MessageChain;
  messageId: number;
}

export interface ForwardMessage {
  type: 'Forward';
  nodeList: ForwardNode[];
}

export interface FileMessage {
  type: 'File';
  id: string;
  name: string;
  size: number;
}

export interface MiraiCodeMessage {
  type: 'MiraiCode';
  code: string;
}
