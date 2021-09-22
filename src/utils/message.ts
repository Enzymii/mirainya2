import * as Messages from '../types/message';

const checkRecvChain = (chain: Messages.RecvMessageChain): boolean =>
  chain.messageChain[0] && chain.messageChain[0].type === 'Source';
export { checkRecvChain };

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

  public static face = (faceId: number, name: string): Messages.FaceMessage => {
    if (faceId) return { type: 'Face', faceId };
    else if (name) return { type: 'Face', name };
    else throw 'Incorrect Params';
  };

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

  public static xml = (xml: string): Messages.XmlMessage => ({
    type: 'Xml',
    xml,
  });

  public static json = (
    json: string | Record<string, unknown>
  ): Messages.JsonMessage => ({
    type: 'Json',
    json: typeof json === 'string' ? json : JSON.stringify(json),
  });

  public static dice = (value?: number): Messages.DiceMessage => ({
    type: 'Dice',
    value: value ?? Math.floor(Math.random() * 6) + 1,
  });

  // To support more...
}
