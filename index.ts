import Bot from './src/bot';
import botConfig from './src/config/botConfig';
import Logger from './src/utils/log';

const main = async () => {
  Logger.log('Started.');
  const bot = new Bot(botConfig);
  await bot.initialize();
  await bot.login();

  bot.listen((msg) => Logger.log(JSON.stringify(msg)), 'all');
};

main();
