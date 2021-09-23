# mirainya2

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

A new version of typescript QQ bot SDK based on `mirai-api-http v2`

This repo is under quite slow construction

Trying my best to make progress every day

## Usage

Firstly you need to guarantee that you have the `mirai-api-http^2` env

I have published it by yarn, so you can use

```sh
yarn install mirainya2
```

An example program can be:

```ts
import { Bot, Logger, MakeMsg } from 'mirainya2';

const main = async (): Promise<void> => {
  const myBot = new Bot(botConfig); // the sample of botConfig can be found in ./src/config_sample

  await myBot.initialize();
  await myBot.login();

  myBot.listen(async (msg) => {
    Logger.log(JSON.stringify(msg));
    if (msg.type === 'FriendMessage') {
      await myBot.api?.sendFriendMessage(msg.sender.id, [MakeMsg.plain('QAQ')]);
    }
  }, 'msg');
};

main();
```

_Welcome contribution_
