/*
限制api存取次數
*/
const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: { type: String, index: true },
  ip: { type: String, index: true },
  hits: { type: Number, default: 1 },
  cdate: { type: Date, default: Date.now, expires: 60 * 60 },
});

module.exports = schema;
