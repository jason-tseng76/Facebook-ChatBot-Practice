/*
後台使用者
*/
const mongoose = require('mongoose');

const schema = mongoose.Schema({
  loginid: { type: String, index: true },
  username: { type: String },
  googleid: { type: String, index: true },
  userpwd: String,
  role: String,
  active: { type: String, default: 'active' }, // stop=停權, active=正常
  logindate: { type: Date, index: true },
  loginip: { type: String },
  pwddate: { type: Date, default: Date.now }, // 上次修改密碼的時間(尚未編寫)
  oldpwds: [String], // 以往設定過的密碼(尚未編寫)
});

module.exports = schema;
