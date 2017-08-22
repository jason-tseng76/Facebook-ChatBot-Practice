// 設定會依環境ENV而改變的 變數、sensitive data等等
const config = {

  PORT: process.env.PORT || 8080,
  IP: process.env.IP || '127.0.0.1',

  // 如果允許CORS的話，允許的origin列在這裡(要有protocol)，設為true則是開放所有
  ALLOW_DOMAIN: ['http://localhost:8088', 'http://127.0.0.1:8088'],

  // 要啟動的db connection資訊，如果只有一個的話，會用預設的mongoose當connection
  DB: {
    mlab: {
      pool: 5,
      uri: 'mongodb://localhost/template',
    },
  },

  // jwt token需要的secret
  JWT_SECRET: 'dev',

  // 其它變數自行加入..
  GITHUB_SECRET: '..........',
  GITHUB_APP_ID: '..........',
  GITHUB_APP_SECRET: '..........',
  FB_APP_ID: '1945705892381778',
  FB_APP_SECRET: '184ad00baec48bc87e905a9255aca7a8',
  FB_PAGE_TOKEN: 'EAAbpmZCSNhFIBABaLL4BfAFtc9ZAELlNnoIi5j4qwVd5GV0vHnScMGlPrEeaZBfjJZA6yJZCHw8Yy7FFS3BRJBZAVjA1akZBZBByEa7LndOmhoiPVOvCEYnvZC8xEC6acf015F6W5xpXBV6uPsCENjJZAYsJfgQWsMEaiQw7oXFhzJBAZDZD',
  FB_VERIFY_TOKEN: 'jason_dev_chatbot_token',

  // 後台的route網址，例如：http://localhost:8080/mlmng
  // 有時有些案子會需要特別的後台網址，所以獨立一個設定出來
  BACKEND_ROUTE: 'mlmng',
  // 一開始啟動時，後台並沒有管理者，這邊可以指定後台的預設管理者帳密
  // 啟動後程式如果發現後台管理者的資料庫是空的，就會新增這一筆進去
  ADMIN_ID: 'admin',
  ADMIN_GOOGLEID: 'jason@medialand.tw',
  ADMIN_PASSWORD: 'admin123',
};

// 把環境對應的config存到global.config裡
global.config = config;
module.exports = global;
