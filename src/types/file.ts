import { FriendInfo, GroupInfo } from './profile';

export interface DownloadInfo {
  sha1: string;
  md5: string;
  url: string;
  downloadTimes?: number;
  uploaderId: number;
  uploadTime: number;
  lastModifyTime: number;
}

interface FileData {
  name: string;
  id: string;
  parent: FileData | null;
  data: GroupInfo | FriendInfo;
  isFile: boolean;
  isDictionary?: boolean; // deprecated
  isDirectory: boolean;
  downloadInfo: DownloadInfo;
}

export default FileData;
