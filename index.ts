import Bot from './src/bot';
import botConfig from './src/config/botConfig';

const main = async () => {
  console.log('Main Function Starts!');
  const bot = new Bot(botConfig);
  await bot.initialize();
};

main();
