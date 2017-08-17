/*
擴充validator
 */
const jwt = require('jsonwebtoken');
const validator = require('validator');
const xssFilters = require('xss-filters');
const mongosanitize = require('mongo-sanitize');

validator.parseToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
};
validator.toStr = (str) => {
  let rs = '';
  if (str === undefined) return '';
  rs = str.toString().trim();
  // rs = validator.sanitize(rs);
  // rs = validator.xssfilter(rs);
  return rs;
};
validator.toAlphanumeric = (str,
    { min = 0, max = Infinity } = {}) => {
  let rs = '';
  if (str === undefined) return '';
  rs = str.toString().trim();
  if (!validator.isAlphanumeric(rs)) return '';
  if (rs.length < min) return '';
  if (rs.length > max) return '';
  return rs;
};
validator.toNormalStr = (str,
    { min = 0, max = Infinity } = {}) => {
  let rs = '';
  if (str === undefined) return '';
  rs = str.toString().trim();
  if (rs.length < min) return '';
  if (rs.length > max) return '';
  const regexp = '([^a-zA-Z0-9_@.-])';
  if (validator.test(str, regexp)) return '';
  return rs;
};
validator.toEmail = (str) => {
  const rs = validator.toNormalStr(str, { max: 50 });
  if (validator.isEmail(rs)) return rs;
  return '';
};

validator.test = (param, regexp) => {
  const reg = new RegExp(regexp);
  return reg.test(param);
};
validator.sanitize = (param) => {
  let str = validator.toStr(mongosanitize(param));
  str = validator.xssfilter(str);
  str = validator.escape(str);
  return str;
};
validator.xssfilter = param => xssFilters.inHTMLData(param);
module.exports = validator;
