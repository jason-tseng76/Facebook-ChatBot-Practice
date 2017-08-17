/*
負責處理log的設定
*/
const path = require('path');
const fs = require('fs');
const log4js = require('log4js');

module.exports = (app) => {
  // 設定log的目錄
  const logDirectory = path.join(__dirname, 'log');
  // 如果存放log的目錄不存在，就建一個
  if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

  // log4js的输出级别6個: trace, debug, info, warn, error, fatal
  log4js.configure({
    // 指定appenders
    appenders: [
      // 把console也當成log輸出
      { type: 'console' },
      // 設定一個依照日期產生log的appender
      {
        type: 'dateFile',
        filename: 'server/log/log4js',
        pattern: '-yyyy-MM-dd.log',
        alwaysIncludePattern: true,
      },
    ],
    // 要加上這一行才會把console.log也寫到log裡
    replaceConsole: true,
  });
  const log4 = log4js.getLogger('normal');
  // 設定為info之後的log才顯示
  log4.setLevel('INFO');
  app.use(log4js.connectLogger(log4));

  // 把logger輸出到global，以方便使用
  global.logger = log4;
};
