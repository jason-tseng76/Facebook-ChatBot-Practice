// 設定會依環境ENV而改變的 變數、sensitive data等等
const config = {

  PORT: process.env.PORT || 8080,

  // 如果允許CORS的話，允許的origin列在這裡(要有protocol)，設為true則是開放所有
  ALLOW_DOMAIN: ['http://localhost:8088', 'http://127.0.0.1:8088'],

  // 要啟動的db connection資訊，如果只有一個的話，會用預設的mongoose當connection
  DB: {
    mlab: {
      pool: 5,
      uri: 'mongodb://..........',
    },
  },

  // jwt token需要的secret
  JWT_SECRET: 'dev',

  // 其它變數自行加入..
  GITHUB_SECRET: '..........',
  GITHUB_APP_ID: '..........',
  GITHUB_APP_SECRET: '..........',

  // 後台的route網址，例如：http://localhost:8080/mlmng
  // 有時有些案子會需要特別的後台網址，所以獨立一個設定出來
  BACKEND_ROUTE: 'mlmng',
  // 一開始啟動時，後台並沒有管理者，這邊可以指定後台的預設管理者帳密
  // 啟動後程式如果發現後台管理者的資料庫是空的，就會新增這一筆進去
  ADMIN_ID: '...',
  ADMIN_GOOGLEID: '...',
  ADMIN_PASSWORD: '...',
};

// 把環境對應的config存到global.config裡
global.config = config;
module.exports = global;
