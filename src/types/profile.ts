export type Permission = 'OWNER' | 'ADMINISTRATOR' | 'MEMBER';

export interface PersonProfile {
  nickname: string;
  email: string;
  age: number;
  level: number;
  sign: string;
  sex: 'UNKNOWN' | 'MALE' | 'FEMALE';
}

export interface MemberProfile {
  id: number;
  memberName: string;
  permission: Permission;
  specialTitle: string;
  joinTimestamp: number;
  lastSpeakTimestamp: number;
  muteTimeRemaining: number;
  group: GroupInfo;
}

export interface FriendInfo {
  id: number;
  nickname: string;
  remark: string;
}

export interface GroupInfo {
  id: number;
  name: string;
  permission: Permission;
}
