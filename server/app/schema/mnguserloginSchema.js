/*
後台使用者
*/
const mongoose = require('mongoose');

const schema = mongoose.Schema({
  mnguserid: { type: String, index: true },
  logindate: { type: Date, default: Date.now },
  loginip: { type: String },
  token: { type: String, index: true },
  useragent: { type: Object },
  cdate: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // 30天後自動刪除
});

module.exports = schema;
