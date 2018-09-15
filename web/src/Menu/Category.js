import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

class Category extends Component {
  render() {
    return (
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <a className="nav-link" href="/menu?cat=food">อาหาร</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/menu?cat=drink">เครื่องดื่ม</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/menu?cat=dessert">ของหวาน</a>
        </li>
      </ul>
    );
  }
}

export default inject('cart')(observer(Category));
