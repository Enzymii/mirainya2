import type { FriendInfo, GroupInfo, MemberProfile, Permission } from './profile';
export declare type Event = BotEvents | FriendEvents | GroupEvents | MessageEvents | RequestEvents | OtherClientEvents | CommandExecutedEvent;
interface BotEvent {
    qq: number;
}
export interface BotOnlineEvent extends BotEvent {
    type: 'BotOnlineEvent';
}
export interface BotOfflineEventActive extends BotEvent {
    type: 'BotOfflineEventActive';
}
export interface BotOfflineEventForce extends BotEvent {
    type: 'BotOfflineEventForce';
}
export interface BotOfflineEventDropped extends BotEvent {
    type: 'BotOfflineEventDropped';
}
export interface BotReloginEvent extends BotEvent {
    type: '"BotReloginEvent';
}
declare type BotEvents = BotOnlineEvent | BotOfflineEventActive | BotOfflineEventDropped | BotOfflineEventForce | BotReloginEvent;
interface FriendEvent {
    friend: FriendInfo;
}
export interface FriendInputStatusChangedEvent extends FriendEvent {
    type: 'FriendInputStatusChangedEvent';
    inputting: boolean;
}
export interface FriendNickChangedEvent extends FriendEvent {
    type: 'FriendNickChangedEvent';
    from: string;
    to: string;
}
declare type FriendEvents = FriendInputStatusChangedEvent | FriendNickChangedEvent;
export interface BotGroupPermissionChangeEvent {
    type: 'BotGroupPermissionChangeEvent';
    origin: Permission;
    current: Permission;
    group: GroupInfo;
}
export interface BotMuteEvent {
    type: 'BotMuteEvent';
    durationSeconds: number;
    operator: MemberProfile;
}
export interface BotUnmuteEvent {
    type: 'BotUnmuteEvent';
    operator: MemberProfile;
}
export interface BotJoinGroupEvent {
    type: 'BotJoinGroupEvent';
    group: GroupInfo;
    invitor: MemberProfile | null;
}
export interface BotLeaveEventActive {
    type: 'BotLeaveEventActive';
    group: GroupInfo;
}
export interface BotLeaveEventKick {
    type: 'BotLeaveEventKick';
    group: GroupInfo;
    operator: MemberProfile;
}
interface GroupDataChangeEvent<T> {
    origin: T;
    current: T;
    group: GroupInfo;
    operator: MemberProfile;
}
export interface GroupNameChangeEvent extends GroupDataChangeEvent<string> {
    type: 'GroupNameChangeEvent';
}
export interface GroupEntranceAnnouncementChangeEvent extends GroupDataChangeEvent<string> {
    type: 'GroupEntranceAnnouncementChangeEvent';
}
export interface GroupMuteAllEvent extends GroupDataChangeEvent<boolean> {
    type: 'GroupMuteAllEvent';
}
export interface GroupAllowAnonymousChatEvent extends GroupDataChangeEvent<boolean> {
    type: 'GroupAllowAnonymousChatEvent';
}
export interface GroupAllowConfessTalkEvent extends GroupDataChangeEvent<boolean> {
    type: 'GroupAllowConfessTalkEvent';
}
export interface GroupAllowMemberInviteEvent extends GroupDataChangeEvent<boolean> {
    type: 'GroupAllowMemberInviteEvent';
}
export interface MemberJoinEvent {
    type: 'MemberJoinEvent';
    member: MemberProfile;
    invitor: MemberProfile | null;
}
export interface MemberLeaveEventKick {
    type: 'MemberLeaveEventKick';
    member: MemberProfile;
    operator: MemberProfile;
}
export interface MemberLeaveEventQuit {
    type: 'MemberLeaveEventQuit';
    member: MemberProfile;
}
export interface MemberCardChangeEvent {
    type: 'MemberCardChangeEvent';
    origin: string;
    current: string;
    member: MemberProfile;
}
export interface MemberSpecialTitleChangeEvent {
    type: 'MemberSpecialTitleChangeEvent';
    origin: string;
    current: string;
    member: MemberProfile;
}
export interface MemberPermissionChangeEvent {
    type: 'MemberPermissionChangeEvent';
    origin: Permission;
    current: Permission;
}
export interface MemberMuteEvent {
    type: 'MemberMuteEvent';
    durationSeconds: number;
    member: MemberProfile;
    operator: MemberProfile;
}
export interface MemberUnmuteEvent {
    type: 'MemberUnmuteEvent';
    member: MemberProfile;
    operator: MemberProfile;
}
export interface MemberHonorChangeEvent {
    type: 'MemberHonorChangeEvent';
    member: MemberProfile;
    action: 'achieve' | 'lose';
    honor: string;
}
declare type GroupEvents = BotGroupPermissionChangeEvent | BotMuteEvent | BotUnmuteEvent | BotJoinGroupEvent | BotLeaveEventKick | BotLeaveEventActive | GroupNameChangeEvent | GroupEntranceAnnouncementChangeEvent | GroupAllowAnonymousChatEvent | GroupAllowConfessTalkEvent | GroupAllowMemberInviteEvent | GroupMuteAllEvent | MemberJoinEvent | MemberMuteEvent | MemberLeaveEventKick | MemberLeaveEventQuit | MemberUnmuteEvent | MemberCardChangeEvent | MemberHonorChangeEvent | MemberPermissionChangeEvent | MemberSpecialTitleChangeEvent;
export interface GroupRecallEvent {
    type: 'GroupRecallEvent';
    authorId: number;
    messageId: number;
    time: number;
    group: GroupInfo;
    operator: MemberProfile;
}
export interface FriendRecallEvent {
    type: 'FriendRecallEvent';
    authorId: number;
    messageId: number;
    time: number;
    operator: number;
}
export interface NudgeEvent {
    type: 'NudgeEvent';
    fromId: number;
    subject: {
        id: number;
        kind: 'Friend' | 'Group';
    };
    action: string;
    suffix: string;
    target: number;
}
declare type MessageEvents = GroupRecallEvent | FriendRecallEvent | NudgeEvent;
export interface NewFriendRequestEvent {
    type: 'NewFriendRequestEvent';
    eventId: number;
    fromId: number;
    groupId: number;
    nick: string;
    message: string;
}
export interface MemberJoinRequestEvent {
    type: 'MemberJoinRequestEvent';
    eventId: number;
    fromId: number;
    groupId: number;
    groupName: string;
    nick: string;
    message: string;
}
export interface BotInvitedJoinGroupRequestEvent {
    type: 'BotInvitedJoinGroupRequestEvent';
    eventId: number;
    fromId: number;
    groupId: number;
    groupName: string;
    nick: string;
    message: string;
}
declare type RequestEvents = NewFriendRequestEvent | MemberJoinRequestEvent | BotInvitedJoinGroupRequestEvent;
interface ClientType {
    id: number;
    platform: string;
}
export interface OtherClientOnlineEvent {
    type: 'OtherClientOnlineEvent';
    client: ClientType;
    kind?: number;
}
export interface OtherClientOfflineEvent {
    type: 'OtherClientOfflineEvent';
    client: ClientType;
}
declare type OtherClientEvents = OtherClientOnlineEvent | OtherClientOfflineEvent;
export interface CommandExecutedEvent {
    type: 'CommandExecutedEvent';
    name: string;
    friend: MemberProfile | null;
    member: MemberProfile | null;
    args: Array<any>;
}
export {};
