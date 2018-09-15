import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import data from './data.json';
import Category from './Category';
import List from './List';
import config from '../config.json';
import querystring from 'query-string';
import rp from 'request-promise';
import dialog from '../dialog';
import moment from 'moment';
// import '../utils/VConsole';
const lineHelper = require('../line-helper');

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menu: [],
      lineProfile: {},
    }
    if (window.liff && !this.state.lineProfile.userId) this.initLiff();
  }

  componentDidMount() {
    const parsed = querystring.parse(this.props.location.search);
    let menu;
    if (parsed.cat === 'drink') {
      menu = data.filter(m => {
        return m.categories.filter(c => { return c.id === 17 }).length > 0;
      });
    } else if (parsed.cat === 'dessert') {
      menu = data.filter(m => {
        return m.categories.filter(c => { return c.id === 18 }).length > 0;
      });
    } else {
      menu = data.filter(m => {
        return m.categories.filter(c => { return c.id === 16 }).length > 0;
      });
    }
    let prevState = { ...this.state };
    prevState.menu = menu;
    this.setState(prevState);
    this.props.cart.loadCart();
  }

  initLiff() {
    window.liff.init(
      data => {
        const userId = data.context.userId;
        window.liff.getProfile()
          .then(profile => {
            let prevState = { ...this.state };
            prevState.lineProfile = {
              displayName: profile.displayName,
              userId: userId,
            }
            this.setState(prevState);
          })
          .catch((err) => {
            console.log(' getProfileerror', err);
          });
      },
      err => {
        console.log('LIFF initialization failed ', err);
      }
    );
  }

  onClickImage(index) {
    let selectedMenu = this.state.menu[index];
    dialog.showSelectedItem(selectedMenu)
      .then((selectedMenu) => {
        this.addItem(selectedMenu);
      });
  }

  addItem(item) {
    this.props.cart.addItem(item);
  }

  removeItem(item) {
    this.props.cart.removeItem(item);
  }

  getOrder() {
    let cart = this.props.cart.toJS();
    let orders = cart.items || [];
    return orders;
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
    return lineHelper.createTextMessage(text);
  }

  sendOrderSummary() {
    return new Promise((resolve, reject) => {
      if (this.state.lineProfile.userId) {
        let orders = this.getOrder();
        let message = [this.createOrderMessage(orders)];
        return window.liff.sendMessages(message);
      } else {
        resolve();
      }
    });
  }

  startLinePayment(total) {
    return this.makeLinePaymentRequest(total)
      .then(() => {
        this.sendOrderSummary();
      }).then(() => {
        this.props.cart.clearItems();
        window.liff.closeWindow();
      });
  }

  makeLinePaymentRequest(total) {
    return new Promise((resolve, reject) => {
      let orders = this.getOrder().map((order) => {
        return {
          name: order.name,
          qty: order.qty,
          price: order.price,
        }
      });
      let userId = this.state.lineProfile.userId;
      let body = {
        productName: 'LINEPAY DEMO SHOP',
        amount: total,
        orderId: moment().format('x'),
        orders,
        userId,
      };

      return rp({
        method: 'POST',
        uri: `${config.api}/reservePayment`,
        body: body,
        json: true,
      }).then((response) => {
        if (response.returnCode === '0000') {
          const paymentUrl = response.info.paymentUrl.web;
          window.liff.openWindow({
            url: paymentUrl,
            external: true
          });
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
    let orders = this.getOrder();
    let count = orders.reduce((count, item) => { return count + item.qty }, 0);
    let total = orders.reduce((total, item) => { return total + (item.price * item.qty) }, 0);
    let items = orders.map((order, index) => {
      return (
        <div className="row" key={index}>
          <div className="col-xs-5">{order.name} ({order.qty})</div>
          <div className="col-xs-2 text-right">{order.price}</div>
          <div className="col-xs-2 text-right">{order.price * order.qty}</div>
          <div className="col-xs-3">
            <button type="button" className="btn btn-success btn-xs" onClick={this.addItem.bind(this, order)}>&nbsp;+&nbsp;</button>
            <button type="button" className="btn btn-danger btn-xs" onClick={this.removeItem.bind(this, order)}>&nbsp;-&nbsp;</button>
          </div>
        </div>
      );
    });
    return (
      <div className="container">
        <Category orders={orders} />
        {this.state.menu.length > 0 &&
          <List
            data={this.state.menu}
            onClickImage={this.onClickImage.bind(this)} />
        }
        <hr />
        {orders.length > 0 &&
          <div>
            <h4>รายการที่สั่ง</h4>
            <div className="row" key={0}>
              <div className="col-xs-5">รายการ</div>
              <div className="col-xs-2 text-right">ราคา</div>
              <div className="col-xs-2 text-right">รวม</div>
              <div className="col-xs-3">&nbsp;</div>
            </div>
            <hr />
            {items}
            <hr />
            <div className="row" key={count + 1}>
              <div className="col-xs-5">รวม {count} ชิ้น</div>
              <div className="col-xs-2 text-right">-</div>
              <div className="col-xs-2 text-right">{total}</div>
              <div className="col-xs-3">บาท</div>
            </div>
            <hr />
            <div className="row text-center">
              <span>ชำระเงิน</span>
            </div>
            <div className="row text-center">
              <div className="col-xs-3">&nbsp;</div>
              <div className="col-xs-6">
                <button
                  className="btn btn-default"
                  onClick={this.startLinePayment.bind(this, total)} >
                  <img src="./images/lp.png" width="100%" alt="linepay" />
                </button>
              </div>
              <div className="col-xs-3">&nbsp;</div>
            </div>
            <br />
          </div>
        }
        {(!orders || orders.length === 0) &&
          <div className="row text-center">
            <span>เลือกรายการอาหารที่ต้องการจากรูปด้านบนได้เลยค่ะ</span>
          </div>
        }
      </div>
    );
  }
}

export default inject('cart')(observer(Menu));