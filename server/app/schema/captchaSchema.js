/*
驗證碼Schema
*/
const mongoose = require('mongoose');

const schema = mongoose.Schema({
  captcha: { type: String, index: true },
  used: { type: Boolean, default: false, index: true },
  cdate: { type: Date, default: Date.now, expires: 60 * 10 }, // 10分鐘後失效
});

module.exports = schema;
