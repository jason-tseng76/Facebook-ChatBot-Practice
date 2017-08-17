const momenttimezone = require('moment-timezone');
const moment = require('moment');

class TimeZone {
  constructor(dateobj, timezone = 'Asia/Taipei') {
    this.tz = timezone;
    try {
      this.timeformat = momenttimezone.tz(dateobj, this.tz).format();
    } catch (e) {
      console.log(e);
      this.timeformat = momenttimezone.tz(new Date(), this.tz).format();
    }
  }
  getYear() {
    return Number(this.timeformat.split('-')[0]);
  }
  getMonth() {
    return Number(this.timeformat.split('-')[1]) - 1;
  }
  getDate() {
    return Number(this.timeformat.split('-')[2].split('T')[0]);
  }
  getHour() {
    return Number(this.timeformat.split('T')[1].split(':')[0]);
  }
  getMinute() {
    return Number(this.timeformat.split('T')[1].split(':')[1]);
  }
  getSecond() {
    if (this.timeformat.indexOf('+') > 0) {
      return Number(this.timeformat.split('T')[1].split(':')[2].split('+')[0]);
    }
    return Number(this.timeformat.split('T')[1].split(':')[2].split('-')[0]);
  }
  getTimezoneOffset() {
    let plus = false;
    let toff = this.timeformat.split('-')[1];
    if (this.timeformat.indexOf('+') > 0) {
      plus = true;
      toff = this.timeformat.split('+')[1];
    }
    const toffa = toff.split(':');
    const offset = (Number(toffa[0]) * 60) + Number(toffa[1]);
    if (plus) return offset;
    return -offset;
  }
  getTime() {
    return new Date(this.timeformat).getTime();
  }
  toUTC() {
    const d = new Date(this.timeformat).toISOString();
    return new Date(d);
  }
  toDate() {
    return new Date(this.timeformat);
  }
  format(fmstr) {
    return moment(this.timeformat).format(fmstr);
  }
}

module.exports = TimeZone;
