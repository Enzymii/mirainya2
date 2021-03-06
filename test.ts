import Bot from './src/bot';
import botConfig from './src/config/botConfig';
import { SourceMessage } from './src/types/message';
import Logger from './src/utils/log';
import MakeMsg from './src/utils/message';

const main = async () => {
  Logger.log('Started.');
  const bot = new Bot(botConfig);
  await bot.login();

  bot.listen(async (msg) => {
    Logger.log(JSON.stringify(msg));
    if (msg.type === 'FriendMessage') {
      const { flag, result, exception } = await bot.api.sendFriendMessage(
        msg.sender.id,
        [MakeMsg.plain('QAQ')],
        (msg.messageChain[0] as SourceMessage).id
      );
      console.log(result);
    } else if (msg.type === 'NewFriendRequestEvent') {
      await bot.api.handleFriendRequestDirect(msg, 'accept', 'QAQ');
    }
  }, 'all');
};

main();
