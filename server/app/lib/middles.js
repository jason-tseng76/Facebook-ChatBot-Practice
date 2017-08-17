const errCodes = require('../errorCodes.js');
const jwt = require('jsonwebtoken');
const User = require('../model/model.js')('mngusers', 'mnguser');
const Userlogin = require('../model/model.js')('mnguserlogins', 'mnguserlogin');
const async = require('async');

const middles = {};

// 處理error
// 所有的router或middleware如果next(err)，都會先到這裡來處理
// 這邊負責將錯誤代碼返回前端頁面
middles.errorHandler = (err, req, res, next) => {
  global.logger.error('errorHandler');
  if (err) {
    if (typeof err === 'string') {
      global.logger.error(err);
      if (err.substr(0, 1) === 'E') {
        res.json({ status: 'ERROR', err: errCodes.get(err) });
      } else {
        res.json({ status: 'ERROR', err: { message: err } });
      }
    } else next(err);
  }
};

// 解析token，只解析，不做其它驗證
// 在低安全性的api呼叫時可以使用
middles.parseToken = (req, res, next) => {
  let t = '';
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    t = req.headers.authorization.split(' ')[1];
  }
  if (t === '') {
    res.locals._err = 'E003001';
    return next();
  }
  return jwt.verify(t, global.config.JWT_SECRET, (err, d) => {
    if (err) {
      if (err.name === 'JsonWebTokenError') res.locals._err = 'E003001';
      if (err.name === 'TokenExpiredError') res.locals._err = 'E003002';
    } else {
      res.locals._payload = d;
      res.locals._token = t;
    }
    next();
  });
};

// 判斷權限，只有admin才可以繼續
middles.needAdmin = (req, res, next) => {
  if (res.locals._user.role !== 'admin') {
    next('E002007');
  } else {
    next();
  }
};

// 從DB驗證token是否真的合法
middles.verifyToken = (req, res, next) => {
  // 先確定token是否有parse成功
  if (res.locals._err) return next(res.locals._err);

  return async.waterfall([
    (cb) => {
      Userlogin.findOne({ token: res.locals._token }).lean().exec((err, d) => {
        if (err) return cb(err);
        if (!d) return cb('E003001');
        return cb(null, d);
      });
    },
    (rs, cb) => {
      User.findOne({ _id: rs.mnguserid }).lean().exec((err, d) => {
        if (err) return cb(err);
        if (!d) return cb('E003001');
        if (rs.active === 'stop') return next('E002006');
        return cb(null, d);
      });
    },
  ], (err, d) => {
    if (err) return next(err);
    res.locals._user = {
      userid: d._id,
      loginid: d.loginid,
      googleid: d.googleid,
      username: d.username,
      role: d.role || '',
      token: res.locals._token,
      exp: res.locals._payload.exp,
    };
    return next();
  });
};

module.exports = middles;
