const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const model = require('./server/model/model.js');

// 決定環境變數
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

console.log(process.env.NODE_ENV);

// 引用設定檔，設定檔裡的變數會被存放在global.config裡
require(`./server/config/config_${process.env.NODE_ENV}.js`);

const port = global.config.PORT;
const app = express();

// 設定log
require('./server/log.js')(app);
// 如果配合nginx，就需要設定trust proxy，否則所有來源ip都會是127.0.0.1
app.set('trust proxy', 'loopback');
// 對於express進行基本的安全性保護
app.use(helmet());
// Cookie的middleware，設定signed cookies的key值(有用到signed cookies才會用到)
app.use(cookieParser(global.config.jwtsecret));
// 設定bodyParser
// 指定上傳的檔案總大小最大50mb (預設是100kb)，
// 如果這個沒設，有上傳檔案功能時有時會被擋掉
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
// 設定view engine
app.set('view engine', 'pug');
// 將預設的views目錄設定到root，以方便靈活使用
app.set('views', './');
// 關掉view的cache(預設在production時會開啟，建議開啟，但cache時就很麻煩)
// app.disable('view cache');

// 設定public dir
app.use(express.static('./server/public'));

// 連接DB
// model.createConnect();

// 掛載router
require('./server/app')(app);

// 啟動server
const server = app.listen(port, global.config.IP, () => {
  global.logger.info(`Listening on port ${port}`);
});

// 使用socket.io
require('./server/socketio/socket.js')(server);

// 程式發生exception時的例外處理
require('./server/exceptionHandler.js')(server);

