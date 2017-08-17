/*
處理UncaughtExecption，並在程式結束時關閉資料庫連結
*/
const cluster = require('cluster');
const model = require('./model/model.js');

module.exports = (server) => {
  function exitHandler(type) {
    global.logger.warn(type);
    try {
      setTimeout(() => { process.exit(1); }, 500);
      server.close();
      if (cluster.worker) cluster.worker.disconnect();
      model.disconnect();
    } catch (e) {
      global.logger.error('error when exit', e.stack);
    }
  }

  // so the program will not close instantly
  // process.stdin.resume(); // 這一行在Azure會出問題
  process.on('SIGINT', exitHandler.bind(null, 'SIGINT'));
  process.on('exit', exitHandler.bind(null, 'exit'));
  process.on('uncaughtException', (e) => {
    // 補捉uncaughtException，並寫入log
    global.logger.error(e);
    exitHandler('uncaughtException');
  });
};
