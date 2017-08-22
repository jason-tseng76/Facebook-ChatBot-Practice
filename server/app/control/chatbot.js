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

  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach((entry) => {
      const pageID = entry.id;
      const timeOfEvent = entry.time;
      if (entry.messaging) {
        // Iterate over each messaging event
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
      if (entry.changes) {
        entry.changes.forEach((d) => {
          console.log(d);
          if (d.field === 'feed' && d.value.item === 'comment') {
            fn.sendPrivateReply(d.value.comment_id, d.value.sender_name, d.value.message);
            // fn.sendTextMessage(d.value.sender_id, d.value.message);
          }
        });
        // fn.getFeed(pageID);
      }
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
};

// Incoming events handling
fn.receivedMessage = (event) => {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;

  console.log('Received message for user %d and page %d at %d with message:',
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  const messageId = message.mid;

  const messageText = message.text;
  const messageAttachments = message.attachments;

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        fn.sendGenericMessage(senderID);
        break;

      default:
        fn.sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    fn.sendTextMessage(senderID, 'Message with attachment received');
  }
};

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
  fn.sendTextMessage(senderID, 'Postback called');
};

// ////////////////////////
// Sending helpers
// ////////////////////////
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

fn.sendGenericMessage = (recipientId) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title: 'rift',
            subtitle: 'Next-generation virtual reality',
            item_url: 'https://www.oculus.com/en-us/rift/',
            image_url: 'http://messengerdemo.parseapp.com/img/rift.png',
            buttons: [{
              type: 'web_url',
              url: 'https://www.oculus.com/en-us/rift/',
              title: 'Open Web URL',
            }, {
              type: 'postback',
              title: 'Call Postback',
              payload: 'Payload for first bubble',
            }],
          }, {
            title: 'touch',
            subtitle: 'Your Hands, Now in VR',
            item_url: 'https://www.oculus.com/en-us/touch/',
            image_url: 'http://messengerdemo.parseapp.com/img/touch.png',
            buttons: [{
              type: 'web_url',
              url: 'https://www.oculus.com/en-us/touch/',
              title: 'Open Web URL',
            }, {
              type: 'postback',
              title: 'Call Postback',
              payload: 'Payload for second bubble',
            }],
          }],
        },
      },
    },
  };

  fn.callSendAPI(messageData);
};

fn.getFeed = (pageid) => {
  request({
    uri: `https://graph.facebook.com/v2.10/${pageid}}/conversations`,
    qs: { access_token: global.config.FB_PAGE_TOKEN },
    method: 'GET',
    // json: {
    //   access_token: global.config.FB_PAGE_TOKEN,
    //   message: 'Hello Fan!',
    // },
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log(body);
    } else {
      // console.error('Unable to send message.');
      console.error(response.body);
    }
  });
};

// fn.callSendAPIByFeed = (id) => {
//   request({
//     uri: `https://graph.facebook.com/v2.6/${id}/messages`,
//     qs: { access_token: global.config.FB_PAGE_TOKEN },
//     method: 'POST',
//     json: {
//       access_token: global.config.FB_PAGE_TOKEN,
//       message: 'Hello Fan!',
//     },
//   }, (error, response, body) => {
//     if (!error && response.statusCode === 200) {
//       console.log('Successfully Hello');
//       console.log(body);
//     } else {
//       console.error('Unable to send message.');
//       console.error(response.body);
//     }
//   });
// };

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

fn.sendPrivateReply = (cid, senderName, comment) => {
  // request({
  //   uri: `https://graph.facebook.com/v2.10/${cid}`,
  //   qs: { access_token: global.config.FB_PAGE_TOKEN },
  //   method: 'GET',
  // }, (error, response, body) => {
  //   if (!error && response.statusCode === 200) {
  //     console.log(body);
  //   } else {
  //     console.error(error);
  //   }
  // });
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

fn.qrcode = (req, res) => {
  request({
    uri: `https://graph.facebook.com/v2.6/me/messenger_codes?access_token=${global.config.FB_PAGE_TOKEN}`,
    method: 'POST',
    json: {
      type: 'standard',
      data: {
        ref: 'from_qrcode', // ref不可以有空白
      },
      image_size: 1000,
    },
  }, (error, response, body) => {
    res.send(body);
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
