const express = require('express');
const chatbot = require('../control/chatbot.js');

module.exports = (app) => {
  const router = express.Router();

  router.get('/webhook', chatbot.webhook_get);
  router.post('/webhook', chatbot.webhook_post);

  // 開始按鈕
  router.get('/add_startbtn', chatbot.startbtn_add);
  router.get('/get_startbtn', chatbot.startbtn_get);
  router.get('/del_startbtn', chatbot.startbtn_del);

  // Greeting message
  router.get('/add_greeting', chatbot.greeting_add);
  router.get('/get_greeting', chatbot.greeting_get);
  router.get('/del_greeting', chatbot.greeting_del);

  // 常駐選單
  router.get('/add_persistentMenu', chatbot.persistentMenu_add);
  router.get('/get_persistentMenu', chatbot.persistentMenu_get);
  router.get('/del_persistentMenu', chatbot.persistentMenu_del);

  // 粉絲團的訂閱
  router.get('/add_subscriptions', chatbot.subscriptions_add);
  router.get('/del_subscriptions', chatbot.subscriptions_del);

  // router.get('/qrcode', chatbot.qrcode);

  // 取得長期的page token
  router.post('/exchangetoken', chatbot.exchangetoken);

  app.use('/chatbot', router);
};
