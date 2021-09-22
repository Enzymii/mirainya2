import * as Messages from '../types/message';

export default class MakeMsg {
  public static plain = (text: string): Messages.PlainMessage => ({
    type: 'Plain',
    text,
  });

  public static at = (qq: number): Messages.AtMessage => ({
    type: 'At',
    target: qq,
  });

  public static atAll = (): Messages.AtAllMessage => ({ type: 'AtAll' });

  public static image = (
    imageId?: string,
    url?: string,
    path?: string,
    base64?: string
  ): Messages.ImageMessage => {
    if (imageId) return { type: 'Image', imageId };
    else if (url) return { type: 'Image', url };
    else if (path) return { type: 'Image', path };
    else if (base64) return { type: 'Image', base64 };
    else throw 'Incorrect Params';
  };

  public static flashImage = (
    imageId?: string,
    url?: string,
    path?: string,
    base64?: string
  ): Messages.FlashImageMessage => {
    if (imageId) return { type: 'FlashImage', imageId };
    else if (url) return { type: 'FlashImage', url };
    else if (path) return { type: 'FlashImage', path };
    else if (base64) return { type: 'FlashImage', base64 };
    else throw 'Incorrect Params';
  };

  public static voice = (
    voiceId?: string,
    url?: string,
    path?: string,
    base64?: string,
    length?: number
  ): Messages.VoiceMessage => {
    if (voiceId) return { type: 'Voice', voiceId, length };
    else if (url) return { type: 'Voice', url, length };
    else if (path) return { type: 'Voice', path, length };
    else if (base64) return { type: 'Voice', base64, length };
    else throw 'Incorrect Params';
  };

  public static poke = (type: Messages.PokeType): Messages.PokeMessage => ({
    type: 'Poke',
    name: type,
  });

  // To support more...
}
