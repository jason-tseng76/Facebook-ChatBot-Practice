const mongoose = require('mongoose');

const pool = {};

module.exports = (collection, schema, conn = mongoose) => {
  if (collection) {
    // 如果pool裡沒有同名的collection存在，就new一個array存放
    if (!pool[collection]) pool[collection] = [];
    const p = pool[collection];
    // 查找是否已經有屬於同一個connection及collection的model，有的話就return回去
    for (let i = 0; i < p.length; i++) {
      if (p[i].conn === conn) {
        return p[i].model;
      }
    }

    // pool裡不存在collection所屬的model，於是建立一個
    let model;
    if (typeof schema === 'string') {
      // 如果schema是字串，則動態require
      model = conn.model(collection, require(`../schema/${schema}Schema.js`));
    } else {
      // 如果schema不是字串，那就假設是schema，直接建立model
      model = conn.model(collection, schema);
    }
    // 把新建的model放到pool裡
    pool[collection].push({ conn, model });
    return model;
  }
  return undefined;
};
