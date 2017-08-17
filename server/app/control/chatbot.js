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
      // console.error(response);
      console.error(error);
    }
  });
};

module.exports = fn;
