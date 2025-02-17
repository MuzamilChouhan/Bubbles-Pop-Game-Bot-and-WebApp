// bot/bot.js

const { Telegraf } = require("telegraf");
const TOKEN = "7783999030:AAFudUhvGdy_ykmcCh_sd1dj5ufLPWh7mu0";
const bot = new Telegraf(TOKEN);

const web_link = "https://bubblespopgame.netlify.app/";

bot.start((ctx) =>
  ctx.reply("Lets Start the GAME !!!", {
    reply_markup: {
      keyboard: [
        [
          { text: "BUBBLES POP GAME - MUZAMIL CHOUHAN", web_app: { url: web_link } }
        ]
      ],
    },
  })
);

bot.launch();
console.log("Bot is running...");
