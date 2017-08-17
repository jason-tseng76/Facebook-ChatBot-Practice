const codes = [
  // E001xxx
  // app存取api授權
  { code: 'E001001', message: '沒有權限' },
  { code: 'E001002', message: '超過存取次數限制' },

  // E002xxx
  // 後台帳號相關
  { code: 'E002001', message: '帳號必需要是5-50個字母的長度' },
  { code: 'E002002', message: '密碼必需要是5-20個字母的長度' },
  { code: 'E002003', message: '錯誤的帳號密碼' },
  { code: 'E002004', message: '請不要使用特殊字元' },
  { code: 'E002005', message: '錯誤的圖像驗證碼，也有可能驗證碼已經過期' },
  { code: 'E002006', message: '帳號被停止' },
  { code: 'E002007', message: '沒有權限' },
  { code: 'E002008', message: '該用戶名稱或Email已經被使用了' },
  { code: 'E002009', message: '錯誤的Email' },
  { code: 'E002010', message: '必需要是米蘭的Email' },
  { code: 'E002011', message: '至少要有一組登入帳號或Google帳號' },

  // E003xxx
  // token相關
  { code: 'E003001', message: '錯誤的token' },
  { code: 'E003002', message: 'token過期' },

  // E004xxx
  // 一般通用
  { code: 'E004001', message: '錯誤的參數' },
  { code: 'E004002', message: '錯誤的日期格式' },
  { code: 'E004003', message: '沒有這筆資料' },

  // E005xxx
  // application相關，目前保留
  // { code: 'E005001', message: 'Application的名稱為必填欄位，長度最多100字元' },
  // { code: 'E005002', message: '相同的名稱已經被使用過了' },
  // { code: 'E005003', message: '已經抽過獎了' },
  // { code: 'E005004', message: '沒有資料' },
  // { code: 'E005005', message: '上線時間不能比下線時間晚' },

  // E006xxx
  // 表單驗證相關
  { code: 'E006001', message: '錯誤的發票號碼' },
  { code: 'E006002', message: '請輸入姓名' },
  { code: 'E006003', message: '錯誤的Email' },
  { code: 'E006004', message: '錯誤的電話號碼' },
  { code: 'E006005', message: '請輸入地址' },
  { code: 'E006006', message: '發票號碼已經被使用過了' },
  { code: 'E006007', message: '錯誤的AppKey' },
  { code: 'E006008', message: '活動還沒開始' },
  { code: 'E006009', message: '活動已經截止' },
  { code: 'E006010', message: '上傳的圖片格式錯誤' },
];

module.exports = {
  // 用code字串來回傳error的物件
  get: (c) => {
    const index = codes.findIndex(x => x.code === c);
    if (index >= 0) return codes[index];
    return { code: '', message: '未知的錯誤' };
  },
};
