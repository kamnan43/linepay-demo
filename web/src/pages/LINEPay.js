import React, { Component } from 'react';
import liffHelper from '../utils/liffHelper';
import messagingApiHelper from '../utils/messagingApiHelper';
import rp from 'request-promise';
import moment from 'moment';
// import '../utils/vConsole';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.orders = [
      {
        name: 'ข้าวมันไก่',
        qty: 2,
        price: 45,
      },
      {
        name: 'ข้าวขาหมู',
        qty: 1,
        price: 45,
      },
      {
        name: 'น้ำแข็ง',
        qty: 3,
        price: 1,
      }
    ];
    this.state = {
      lineProfile: {},
    }
    liffHelper.getProfile()
      .then(profile => {
        this.setState({ lineProfile: profile });
      });
  }

  createOrderMessage(orders) {
    let total = orders.reduce((total, item) => { return total + (item.qty * item.price) }, 0);
    let text = `รายการที่สั่ง\n`;
    text += 'ร้าน LINEPAY DEMO SHOP\n'
    text += `${moment().format('DD/MM/YYYY HH:mm')}\n`
    text += '----------\n'
    orders.forEach(order => {
      text += `${order.name} [${order.qty}] x ฿${order.price}\n`
    });
    text += '----------\n'
    text += `รวมทั้งหมด ${total} บาท`;
    return messagingApiHelper.createTextMessage(text);
  }

  sendOrderSummary() {
    return new Promise((resolve, reject) => {
      if (this.state.lineProfile.userId) {
        let orders = this.orders;
        let message = [this.createOrderMessage(orders)];
        return liffHelper.sendMessages(message);
      } else {
        resolve();
      }
    });
  }

  startLinePayment(method, payType) {
    return this.makeLinePaymentRequest(method, payType)
      .then(() => {
        this.sendOrderSummary();
      }).then(() => {
        liffHelper.closeWindow();
      });
  }

  makeLinePaymentRequest(method, payType) {
    return new Promise((resolve, reject) => {
      const total = this.orders.reduce((a, b) => (a + (b.qty * b.price)), 0);
      let userId = this.state.lineProfile.userId;
      let body = {
        productName: 'LINEPAY DEMO SHOP',
        amount: total,
        orderId: moment().format('x'),
        orders: this.orders,
        userId,
        payType,
      };

      return rp({
        method: 'POST',
        uri: `https://us-central1-sitthi-linepay-demo.cloudfunctions.net/reservePayment${method}`,
        body: body,
        json: true,
      }).then((response) => {
        console.log('response', response);
        if (response.returnCode === '0000') {
          const paymentUrl = response.info.paymentUrl.web;
          liffHelper.openWindow(paymentUrl, false);
          resolve(response);
        } else {
          console.log('response.returnCode', response.returnCode);
          reject(new Error(response.returnCode));
        }
      }).catch(function (err) {
        console.log('err', err);
        reject(err);
      });
    });
  }

  render() {
    return (
      <div className="page-content">
        <div className="col-lg-3" />
        <div className="col-lg-6">
          <div>
            <h4>รายการที่สั่ง</h4>
            <div className="row" key={0}>
              <div className="col-xs-6">รายการ</div>
              <div className="col-xs-3 text-right">ราคา</div>
              <div className="col-xs-3 text-right">รวม</div>
            </div>
            <hr />
            <div className="row" key={1}>
              <div className="col-xs-6">ข้าวมันไก่ (2)</div>
              <div className="col-xs-3 text-right">45</div>
              <div className="col-xs-3 text-right">90 บาท</div>
            </div>
            <div className="row" key={2}>
              <div className="col-xs-6">ข้าวขาหมู (1)</div>
              <div className="col-xs-3 text-right">45</div>
              <div className="col-xs-3 text-right">45 บาท</div>
            </div>
            <div className="row" key={3}>
              <div className="col-xs-6">น้ำแข็ง (3)</div>
              <div className="col-xs-3 text-right">1</div>
              <div className="col-xs-3 text-right">3 บาท</div>
            </div>
            <hr />
            <div className="row" key='count'>
              <div className="col-xs-6">รวม 3 รายการ</div>
              <div className="col-xs-3">-</div>
              <div className="col-xs-3 text-right">138 บาท</div>
            </div>
            <hr />
            <div className="row text-center">
              <span>ชำระเงิน</span>
            </div>
            <div className="row text-center">
              <div className="col-xs-3">&nbsp;</div>
              <div className="col-xs-3">
                <button
                  className="btn btn-default"
                  onClick={this.startLinePayment.bind(this, 'Server', 'NORMAL')} >
                  <img src="./images/lp.png" width="100%" alt="linepay" />
                </button>
                <span>Server Mode</span>
              </div>
              <div className="col-xs-3">
                <button
                  className="btn btn-default"
                  onClick={this.startLinePayment.bind(this, 'Client', 'NORMAL')} >
                  <img src="./images/lp.png" width="100%" alt="linepay" />
                </button>
                <span>Client Mode</span>
              </div>
              <div className="col-xs-3">&nbsp;</div>
            </div>
            <br />
          </div>
        </div>
        <div className="col-lg-3" />
      </div>
    );
  }
}