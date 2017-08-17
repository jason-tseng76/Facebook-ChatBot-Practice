const validators = require('./validators.js');

const fn = {};

// 亂數產生字串
fn.randomStr = (length = 10, addchars = '') => {
  let allowstr = '';
  for (let i = 0; i < 26; i++) {
    allowstr += String.fromCharCode(97 + i);
    allowstr += String.fromCharCode(65 + i);
  }
  allowstr += `0123456789${addchars}`;
  let id = '';
  while (id.length < length) {
    const ra = Math.floor(Math.random() * allowstr.length);
    id += allowstr.substr(ra, 1);
  }
  return id;
};

// 依照timestamp+亂數產生字串
fn.newID = (length = 15) => {
  let len = length < 15 ? 15 : length;
  const timestamp = new Date().getTime().toString(16);
  len -= timestamp.length;
  const rand = fn.randomStr(len);
  return `${timestamp}${rand}`;
};

fn.decodeBase64 = (dataString) => {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const response = {};
  if (!matches) {
    return null;
  }
  if (matches.length !== 3) {
    return null;
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
};

fn.hashName = (param, replace = '○') => {
  const str = validators.toStr(param);
  if (str === '') return '';
  if (str.length <= 2) return `${str.substr(0, 1)}${replace}`;
  const cut = Math.floor(str.length / 3);
  let bstr = str.substr(0, cut);
  const estr = str.substr(str.length - cut);
  while (bstr.length + estr.length < str.length) {
    bstr += replace;
  }
  bstr += estr;
  return bstr;
};

fn.hashEmail = (param, replace = '○') => {
  const str = validators.toStr(param);
  if (!validators.isEmail(str)) return '';
  const sarray = str.split('@');
  const cut = Math.ceil(sarray[0].length / 3);
  let out = sarray[0].substr(0, (sarray[0].length - cut));
  for (let i = 0; i < cut; i++) {
    out += replace;
  }
  out += '@';
  const lastIndexofDot = sarray[1].lastIndexOf('.');
  for (let i = 0; i < lastIndexofDot; i++) {
    out += replace;
  }
  out += sarray[1].substr(lastIndexofDot);
  return out;
};

module.exports = fn;
