const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const rp = require('request-promise');
const config = require('./config.json');
const firebase = require("firebase-admin");
const lineHelper = require('./line-helper');
const lineSdk = require('@line/bot-sdk');
const line = new lineSdk.Client(config.line);
var firebaseConfig = config.firebase;
firebaseConfig.credential = firebase.credential.cert(require(firebaseConfig.serviceAccountFile));
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

exports.reservePayment = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    reservePayment(req, res);
  });
});

exports.confirmPayment = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    confirmPayment(req, res);
  });
});

function reservePayment(req, res) {
  let { productName, amount, orderId } = req.body;
  let url = `${config.linepay.api}/v2/payments/request`;

  let payload = {
    productName,
    amount,
    orderId,
    currency: 'THB',
    confirmUrl: `${config.apiUrl}/confirmPayment`,
    langCd: 'th',
    confirmUrlType: 'SERVER',
  };
  let headers = {
    'X-LINE-ChannelId': config.linepay.channelId,
    'X-LINE-ChannelSecret': config.linepay.channelSecret,
    'Content-Type': 'application/json',
  };
  rp({
    method: 'POST',
    uri: url,
    body: payload,
    headers,
    json: true,
  })
    .then(function (response) {
      console.log('response', JSON.stringify(response));
      if (response && response.returnCode === '0000' && response.info) {
        const data = req.body;
        const transactionId = response.info.transactionId;
        data.transactionId = transactionId;
        saveTx(orderId, data);
      }
      res.send(response);
    })
    .catch(function (err) {
      console.log('payment err', err);
      res.status(400).send(err);
    });
};

function confirmPayment(req, res) {
  let { transactionId, orderId } = req.query;
  let url = `${config.linepay.api}/v2/payments/${transactionId}/confirm`;
  let data;
  getOrderInfo(orderId)
    .then((orderInfo) => {
      data = orderInfo;
      let body = {
        amount: data.amount,
        currency: 'THB',
      };
      let headers = {
        'X-LINE-ChannelId': config.linepay.channelId,
        'X-LINE-ChannelSecret': config.linepay.channelSecret,
        'Content-Type': 'application/json',
      };
      return rp({
        method: 'POST',
        uri: url,
        body: body,
        headers,
        json: true,
      });
    })
    .then(function (response) {
      console.log('response', JSON.stringify(response));
      if (response && response.returnCode === '0000' && response.info) {
        data.status = 'paid';
        saveTx(orderId, data);
        line.pushMessage(
          data.userId,
          [lineHelper.createTextMessage('ได้รับชำระเงินเรียบร้อยแล้ว')]
        );
      }
      res.send(response);
    })
    .catch(function (err) {
      console.log('payment err', err);
      res.status(400).send(err);
    });
};

function saveTx(orderId, object) {
  object['lastActionDate'] = Date.now();
  var txRef = database.ref("/transactions/" + orderId);
  return txRef.update(object);
}

function getOrderInfo(orderId) {
  return new Promise((resolve, reject) => {
    let list = [];
    var txRef = database.ref("/transactions/" + orderId);
    txRef.once("value", function (snapshot) {
      list.push(snapshot.val());
      if (list.length > 0) {
        resolve(list[0]);
      } else {
        reject();
      }
    });
  });
}