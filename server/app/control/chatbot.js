const request = require('request');

const fn = {};

fn.webhook_get = (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === global.config.FB_VERIFY_TOKEN) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
};

fn.webhook_post = (req, res) => {
  console.log(req.body);
  const data = req.body;

  // 從資料格式先確定資料是屬於page的
  if (data.object === 'page') {
    // Facebook是用批次的方式將資料傳入，所以data.entry是一個陣列，一次可能會有很多筆資料
    data.entry.forEach((entry) => {
      // 粉絲頁的ID，如果Chatbot訂閱不止一個粉絲頁，就可以用這個值來做判斷
      const pageID = entry.id;
      const timeOfEvent = entry.time;
      // 如果entry的內容有messaging，表示這是一個訊息(可能是使用者輸入的訊息或是我們定義好的按鈕訊息)
      if (entry.messaging) {
        // 一樣，訊息會是陣列，有可能不止一筆
        entry.messaging.forEach((event) => {
          if (event.message) {
            fn.receivedMessage(event);
          } else if (event.postback) {
            fn.receivedPostback(event);
          } else {
            console.log('Webhook received unknown event: ', event);
          }
        });
      }
      // 粉絲頁的feed有發生變化的事件
      if (entry.changes) {
        entry.changes.forEach((d) => {
          console.log(d);
          // 確定是feed裡的comment發生了改變
          // 是的話就回覆private reply
          if (d.field === 'feed' && d.value.item === 'comment') {
            fn.sendPrivateReply(d.value.comment_id, d.value.sender_name, d.value.message);
          }
        });
      }
    });

    // 無論如何，除非程式真的出錯，否則一定要在20秒之內回傳200，不然Facebook會認為這個webhook失效，
    // 如果Facebook沒收到200，它會定期再次傳送，一但一段時間之後都沒收到200，就會把這個webhook給關掉。
    res.sendStatus(200);
  }
};

// Incoming events handling
fn.receivedMessage = (event) => {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;

  console.log('Received message for user %d and page %d at %d with message:', senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  const messageId = message.mid;
  let messageText = message.text;
  const messageAttachments = message.attachments;
  const quick_reply = message.quick_reply;

  if (messageText) {
    if (quick_reply) messageText += ` - ${message.quick_reply.payload}`;
    switch (messageText) {
      case '電影':
        fn.sendMovieMessage(senderID);
        break;
      case '顏色':
        fn.sendColorMessage(senderID);
        break;
      case '地點':
        fn.sendLocationMessage(senderID);
        break;
      default:
        fn.sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    messageAttachments.forEach((ele) => {
      if (ele.type === 'location') {
        fn.sendTextMessage(senderID, `你的位置是：${JSON.stringify(ele.payload.coordinates)}`);
      } else {
        fn.sendTextMessage(senderID, `Message with attachment received - type=${ele.type}`);
      }
    });
  }
};

// 處理Postback事件
fn.receivedPostback = (event) => {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  const payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    'at %d', senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  fn.sendTextMessage(senderID, `Postback called : ${payload}`);
};

// 傳送純文字訊息
fn.sendTextMessage = (recipientId, messageText) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: messageText,
    },
  };
  console.log('sendTextMessage');
  console.log(messageData);

  fn.callSendAPI(messageData);
};

// 傳送圖文訊息+Button
fn.sendMovieMessage = (recipientId) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          image_aspect_ratio: 'square',
          elements: [
            {
              title: '不幹了！我開除了黑心公司',
              subtitle: 'To Each His Own',
              // item_url: 'http://www.ambassador.com.tw/movie_review.html?movieid=90904268-05f5-41fe-8a0c-a5917cf33b71',
              image_url: 'http://www.ambassador.com.tw/assets/img/movies/ToEachHisOwn_180x270_Poster.jpg',
              buttons: [{
                type: 'web_url',
                url: 'http://www.ambassador.com.tw/movie_review.html?movieid=90904268-05f5-41fe-8a0c-a5917cf33b71',
                title: 'Open Web URL',
              }, {
                type: 'postback',
                title: '加入待看清單',
                payload: 'Add-Movie1',
              }],
            },
            {
              title: '電影版妖怪手錶：飛天巨鯨與兩個世界的大冒險喵！',
              subtitle: 'YO-KAI WATCH The Movie: A Whale of Two Worlds',
              item_url: 'http://www.ambassador.com.tw/movie_review.html?movieid=7e79de57-fc0c-4a48-93c8-df3d485451d7',
              image_url: 'http://www.ambassador.com.tw/assets/img/movies/YOKAIWATCHTheMovieAWhaleofTwoWorlds_180x270_Poster.jpg',
              buttons: [{
                type: 'web_url',
                url: 'http://www.ambassador.com.tw/movie_review.html?movieid=7e79de57-fc0c-4a48-93c8-df3d485451d7',
                title: 'Open Web URL',
              }, {
                type: 'postback',
                title: '加入待看清單',
                payload: 'Add-Movie2',
              }],
            },
          ],
        },
      },
    },
  };
  fn.callSendAPI(messageData);
};

// 傳送quick_replies
fn.sendColorMessage = (recipientId) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: 'Pick a color:',
      quick_replies: [
        {
          content_type: 'text',
          title: 'Red',
          payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED',
          image_url: 'https://image.freepik.com/free-vector/red-geometrical-background_1085-125.jpg',
        },
        {
          content_type: 'text',
          title: 'Green',
          payload: 'DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN',
          // "image_url":"http://petersfantastichats.com/img/green.png"
        },
      ],
    },
  };
  fn.callSendAPI(messageData);
};

// 傳送quick_replies的位置資訊
fn.sendLocationMessage = (recipientId) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: '告訴我你在哪裡',
      quick_replies: [
        {
          content_type: 'location',
        },
      ],
    },
  };
  fn.callSendAPI(messageData);
};

// 把訊息送出去給FB
fn.callSendAPI = (messageData) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: global.config.FB_PAGE_TOKEN },
    method: 'POST',
    json: messageData,

  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const recipientId = body.recipient_id;
      const messageId = body.message_id;

      console.log('Successfully sent generic message with id %s to recipient %s',
        messageId, recipientId);
    } else {
      console.error('Unable to send message.');
      console.error(response.body);
      console.error(error);
    }
  });
};

// 回覆私人訊息
fn.sendPrivateReply = (cid, senderName, comment) => {
  request({
    uri: `https://graph.facebook.com/v2.6/${cid}/private_replies`,
    qs: { access_token: global.config.FB_PAGE_TOKEN },
    method: 'POST',
    json: { message: `yes, ${senderName}, you said:'${comment}'` },
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log(body);
    } else {
      console.error('Unable to send message.');
      console.error(response.body);
      console.error(error);
    }
  });
};

fn.subscriptions_add = (req, res) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
    qs: {
      access_token: global.config.FB_PAGE_TOKEN,
    },
    method: 'POST',
  }, (error, response, body) => {
    res.send(body);
  });
};
fn.subscriptions_del = (req, res) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
    qs: {
      access_token: global.config.FB_PAGE_TOKEN,
    },
    method: 'DELETE',
  }, (error, response, body) => {
    res.send(body);
  });
};

fn.persistentMenu_get = (req, res) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: {
      access_token: global.config.FB_PAGE_TOKEN,
      fields: 'persistent_menu',
    },
    method: 'GET',
  }, (error, response, body) => {
    res.send(body);
  });
};
fn.persistentMenu_add = (req, res) => {
  const menuobj = {
    persistent_menu: [
      {
        locale: 'default',
        composer_input_disabled: false,
        call_to_actions: [
          {
            title: '帳戶',
            type: 'nested',
            call_to_actions: [
              {
                title: 'Pay Bill',
                type: 'postback',
                payload: 'PAYBILL_PAYLOAD',
              },
              {
                title: 'History',
                type: 'postback',
                payload: 'HISTORY_PAYLOAD',
              },
              {
                title: 'Contact Info',
                type: 'postback',
                payload: 'CONTACT_INFO_PAYLOAD',
              },
            ],
          },
          {
            type: 'web_url',
            title: 'Latest News',
            url: 'http://petershats.parseapp.com/hat-news',
            webview_height_ratio: 'full',
          },
        ],
      },
      // {
      //   locale: 'zh_CN',
      //   composer_input_disabled: false,
      // },
    ],
  };
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: global.config.FB_PAGE_TOKEN },
    method: 'POST',
    json: menuobj,
  }, (error, response, body) => {
    res.send(body);
  });
};
fn.persistentMenu_del = (req, res) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: {
      access_token: global.config.FB_PAGE_TOKEN,
    },
    json: {
      fields: ['persistent_menu'],
    },
    method: 'DELETE',
  }, (error, response, body) => {
    res.send(body);
  });
};

fn.startbtn_add = (req, res) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: global.config.FB_PAGE_TOKEN },
    method: 'POST',
    json: {
      get_started: {
        payload: 'GET START',
      },
    },
  }, (error, response, body) => {
    res.send(body);
  });
};

fn.startbtn_get = (req, res) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: {
      access_token: global.config.FB_PAGE_TOKEN,
      fields: 'get_started',
    },
    method: 'GET',
  }, (error, response, body) => {
    // console.log(response);
    // console.log(body);
    // res.sendStatus(200);
    res.send(body);
  });
};

fn.startbtn_del = (req, res) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: {
      access_token: global.config.FB_PAGE_TOKEN,
    },
    json: {
      fields: ['get_started'],
    },
    method: 'DELETE',
  }, (error, response, body) => {
    res.send(body);
  });
};

fn.greeting_add = (req, res) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: global.config.FB_PAGE_TOKEN },
    method: 'POST',
    json: {
      greeting: [{
        locale: 'default',
        text: 'Yo {{user_full_name}}!',
      }],
    },
  }, (error, response, body) => {
    res.send(body);
  });
};

fn.greeting_get = (req, res) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: {
      access_token: global.config.FB_PAGE_TOKEN,
      fields: 'greeting',
    },
    method: 'GET',
  }, (error, response, body) => {
    res.send(body);
  });
};

fn.greeting_del = (req, res) => {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: global.config.FB_PAGE_TOKEN },
    json: {
      fields: ['greeting'],
    },
    method: 'DELETE',
  }, (error, response, body) => {
    res.send(body);
  });
};

fn.exchangetoken = (req, res) => {
  const token = req.body.token;
  request({
    uri: 'https://graph.facebook.com/v2.10/oauth/access_token',
    qs: {
      fb_exchange_token: token,
      grant_type: 'fb_exchange_token',
      client_id: global.config.FB_APP_ID,
      client_secret: global.config.FB_APP_SECRET,
    },
    method: 'GET',
  }, (error, response, body) => {
    console.log(body);
    res.send(body);
  });
};

module.exports = fn;
