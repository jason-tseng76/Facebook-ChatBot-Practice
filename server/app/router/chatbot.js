const express = require('express');
const chatbot = require('../control/chatbot.js');

module.exports = (app) => {
  const router = express.Router();

  router.get('/webhook', chatbot.webhook_get);
  router.post('/webhook', chatbot.webhook_post);
  // router.post('/uploadBase64', upload.uploadBase64);
  // router.post('/uploadeditor', upload.uploadeditor);

  app.use('/chatbot', router);
};
