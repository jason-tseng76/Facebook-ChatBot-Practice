const ratelimit = require('../model/model.js')('ratelimits', 'ratelimit');

class RateLimit {
  constructor({ name = 'api', max = 120, time = 60 } = {}) {
    this.max = max;
    this.time = time;
    this.name = name;
    this.rate = this.rate.bind(this);
  }

  rate(req, res, next) {
    const ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    const name = this.name;
    ratelimit.findOneAndUpdate({ ip, name }, { $inc: { hits: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true })
      .lean()
      .exec((err, d) => {
        // 取得上次存取與這次存取之間的時間差
        let ttl = (new Date().getTime()) - (new Date(d.cdate).getTime());
        let hits = d.hits;
        let toomany = false;
        // 如果時間差是在time的設定裡，就判斷是否超過存取次數
        if (ttl <= this.time * 1000) {
          if (this.max < hits) {
            toomany = true;
          }
        }
        // 如果已經超過time的設定，表示是另外一次新的計算
        if (ttl > this.time * 1000) {
          hits = 1;
          ratelimit.findOneAndUpdate({ ip, name }, { cdate: Date.now(), hits }, { new: true }).exec((err2) => {
            if (err2) console.log(err2);
          });
          ttl = 0;
        }
        res.set('X-Rate-Limit-Limit', this.max);
        res.set('X-Rate-Limit-Remaining', this.max - hits);
        res.set('X-Rate-Limit-Reset', (this.time * 1000) - ttl);
        if (toomany) return next('E001002');
        return next();
      });
  }
}

module.exports = RateLimit;
