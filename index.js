import config from './config/config';
import winston from './middleware/winston';
import Complex from './middleware/complexMiddleWare';
import Stocks from './middleware/stockMiddleware';
import Knex from './imports/knex';
import ScreenShots from './imports/screenshots';
import Users from './imports/users';
import Files from './imports/fileStreams';

let env = process.env.NODE_ENV || 'development';

const Telegraf = require('telegraf');
const { Extra, Markup } = Telegraf;
const bot = new Telegraf(config[`${env}`]['token']);
const complexMiddleWare = new Complex();
const stocksMiddleware = new Stocks();
const migrations = new Knex();
const user = new Users();

migrations.migrateLatest();


// middlewares
bot.use(Telegraf.memorySession());


bot.hears(/stocks (.{1,5})/i, stocksMiddleware.getStocks, (ctx) => {
  winston.log('debug', 'symbol: ' + ctx.match[1]);
});

bot.hears(/\/ss (.+)/, (ctx) => {

  winston.log('debug', 'in the ss function'); // left debug messages for now
  const ss = new ScreenShots(); // the class
  ss.createScreenshot(ctx); // the method

})


bot.command('register', (ctx) => {

  winston.log('debug', 'in register command');
  user.registerUser(ctx);

});



bot.command('leaderboard', (ctx) => {
  user.getLeaderboard(ctx);
});



bot.on('message', (ctx) => {
  if (ctx.message.reply_to_message) {

    if (ctx.message.text == 'lol') {
      let userId = ctx.from.id;
      let replyTo = ctx.message.reply_to_message.from.id;
      let originalMessageId = ctx.message.reply_to_message.message_id;

      winston.log('debug', 'user id of person saying lol ', userId);
      winston.log('debug', 'user id of original message ', replyTo);
      // insert inline buttons with emojis
      // increment

      let keyboardArray = JSON.stringify({
        inline_keyboard: [
          [{ text: `😂`, callback_data: 'tearsofjoy' },
            { text: `👍`, callback_data: 'thumbsup' },
            { text: `🙄`, callback_data: 'eyeroll' },
            { text: `🔥`, callback_data: 'fire' },
            { text: `😊`, callback_data: 'smiling' }
          ]
        ]
      });

      ctx.reply('test', { reply_to_message_id: originalMessageId, reply_markup: keyboardArray });


    }
  }
});

//

bot.action('tearsofjoy', (ctx, next) => {
  let increment = 1;

  let keyboardArray = JSON.stringify({
    inline_keyboard: [
      [{ text: `😂${increment}`, callback_data: 'tearsofjoy' },
        { text: `👍`, callback_data: 'thumbsup' },
        { text: `🙄`, callback_data: 'eyeroll' },
        { text: `🔥`, callback_data: 'fire' },
        { text: `😊`, callback_data: 'smiling' }
      ]
    ]
  });

  ctx.answerCallbackQuery('selected 😂')
    .then(() => {
      winston.log('debug', 'in here');
      ctx.editMessageReplyMarkup(keyboardArray);
    })
    .then(next);
})
bot.action('thumbsup', (ctx, next) => {
  ctx.answerCallbackQuery('selected 👍').then(next);
})
bot.action('eyeroll', (ctx, next) => {
  ctx.answerCallbackQuery('selected 🙄').then(next);
})
bot.action('fire', (ctx, next) => {
  ctx.answerCallbackQuery('selected 🔥').then(next);
})
bot.action('smiling', (ctx, next) => {
  ctx.answerCallbackQuery('selected 😊').then(next);
})


bot.catch((err) => {
  winston.log('debug', 'in bot catch error');
  winston.log('error', err);
})

bot.startPolling()