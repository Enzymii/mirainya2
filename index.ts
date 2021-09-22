import Bot from './src/bot';
import botConfig from './src/config/botConfig';
import Logger from './src/utils/log';
import MakeMsg from './src/utils/message';

const main = async () => {
  Logger.log('Started.');
  const bot = new Bot(botConfig);
  await bot.initialize();
  await bot.login();
  const id = await bot.api?.sendFriendMessage(0, [MakeMsg.plain('test')]);
  if (id) {
    await bot.api?.recallMessage(id);
  }

  bot.listen((msg) => Logger.log(JSON.stringify(msg)), 'all');
};

main();
