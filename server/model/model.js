const mongoose = require('mongoose');
const bluebird = require('bluebird');

// 設定mongoose的promise
mongoose.Promise = bluebird;

// 依照設定檔開啟db connection
exports.createConnect = () => {
  const conns = Object.keys(global.config.DB);
  const opts = {
    // server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    socketTimeoutMS: 0,
    keepAlive: true,
    useMongoClient: true,
  };
  if (conns.length === 1) {
    // 如果只有設定一個db connection的話，就用預設的mongoose.connect方式連接
    global.logger.info('Only one db connection, use Mongoose.connect()');
    const obj = global.config.DB[conns[0]];
    opts.poolSize = obj.poolSize || global.config.defaultPoolSize;
    mongoose.connect(obj.uri, opts);
  } else {
    global.logger.info(`${conns.length} db connections, use Mongoose.createConnection() for each`);
    // 如果設定了不只一個db connection，就分別產生createConnection
    // 然後儲存在global.config.dbconnect的物件裡
    conns.forEach((ele) => {
      const obj = global.config.DB[ele];
      opts.poolSize = obj.pool || 5;
      const connect = mongoose.createConnection(obj.uri, opts);
      obj.connect = connect;
    });
  }
};

// 依照命名取得connection
exports.getConnect = name => global.config.DB[name].connect;

// 中斷所有資料庫連線
exports.disconnect = () => {
  mongoose.disconnect(() => {
    global.logger.info('mongoose disconnected');
  });
};
