const middles = require('./lib/middles.js');

// 處理HTTP 500
function http500(err, req, res, next) {
  global.logger.error(err);
  global.logger.error(`http 500 - ${req.path} - ${new Date().toString()}`);
  if (res.headersSent) {
    // 如果標頭已經傳送，則委派給Express預設的error handler處理(通常不會跑到這裡)
    return next(err);
  }
  // 如果是開發階段，就顯示所有錯誤
  if (process.env.NODE_ENV === 'dev') {
    return res.status(500).send(err);
  }
  // 如果是production階段，就只顯示HTTP 500
  return res.status(500).send('HTTP 500');
}

// 處理HTTP 404
function http404(req, res) {
  global.logger.warn(`http 404 - ${req.path}`);
  res.status(404).send('HTTP 404...');
}

module.exports = (app) => {
  // 掛載Router
  // require('./router/api.js')(app);
  // require('./router/mng_api.js')(app);
  // require('./router/mlmng.js')(app);
  require('./router/chatbot.js')(app);

  // app.get('/socket', (req, res) => {
  //   res.render('server/public/socket');
  // });

  // 根目錄的route不管怎樣都要有，即使是空的
  // 有些雲端平台會做health check，如果/是404的話，會被判定成異常的instance
  const messengerButton = '<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href="https://developers.facebook.com/docs/messenger-platform/guides/quick-start">docs</a>.<script src="https://button.glitch.me/button.js" data-style="glitch"></script><div class="glitchButton" style="position:fixed;top:20px;right:20px;"></div></body></html>';
  app.all('/', (req, res) => {
    // res.send(' ');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(messengerButton);
    res.end();
  });

  app.use(http404);
  // 在500之前加入自行定義的錯誤處理middleware
  app.use(middles.errorHandler);
  app.use(http500);
};
