const TOKEN = process.env.TELEGRAM_TOKEN;
const DEV_MODE = process.env.DEV_MODE || true;

const url = process.env.ROUTE_URL;

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const json = require('body-parser');
console.log(`DEV: ${DEV_MODE}`);
// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN, {polling: DEV_MODE ? true : false});

// This informs the Telegram servers of the new webhook.
if (!DEV_MODE) {
  bot.setWebHook(`${url}/bot${TOKEN}`);
}

const app = express();

// parse the updates to JSON
app.use(json());

app.use(function (req, res, next) {
  console.log('>>> Request:', req);
  next();
});

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Relay message
// eslint-disable-next-line no-unused-vars
app.post('/new-message', function(req, res, next) {
  const { message, patientId, personalId } = req.body;
  const chatId = personalId; // TODO look personalId in DB to get chatId or die
  console.log('new-message for', message, personalId, 'with external chatId', chatId, 'and patientId', patientId);
  if (chatId) {
    bot.sendMessage(chatId, message)
      .then((result) => {
        console.log('new-message result', result);
        res.end('ok');  
      })
      .catch((error) => {
        console.error('new-message error', error);
        res.status(404).end('no chatId could be found for ID(' + personalId + ')');
      });
  } else {
    res.status(404).end('no chatId could be found for ID(' + personalId + ')');
  }
});

// Start Express Server
const port = process.env.PORT || process.env.TELEGRAM_BOT_CUSTOM_PORT || 8080;
const host = process.env.IP || process.env.TELEGRAM_BOT_CUSTOM_HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Telegram Bot started at: ${new Date()} on port: ${port}`);
});

// Just to ping!
//bot.on('message', msg => {
//  bot.sendMessage(msg.chat.id, 'I am alive!');
//});

// eslint-disable-next-line no-unused-vars
bot.onText(/\/help/, function(msg, match) {
  const fromId = msg.from.id;
  bot.sendMessage(fromId, 'I can help you in getting the updates related to your health care.');
});

// eslint-disable-next-line no-unused-vars
bot.onText(/\/myid/, function(msg, match) {
  const fromId = msg.from.id;
  bot.sendMessage(fromId, `This is your id: ${fromId}`);
});

// eslint-disable-next-line no-unused-vars
bot.onText(/\/start/, function(msg, match) {
  const fromId = msg.from.id;
  bot.sendMessage(fromId, 'They call me HIS TelegramBot. ' +
    'I can help you in getting the updates related to your health care.'+
    'To help you I have few commands.\n/help\n/start\n/sentiments');
});
console.log('HIS TelegramBot has started. Start conversations in your Telegram.');