import storage from 'store';
import BaseStore from './BaseStore';

export class CartStore extends BaseStore {
  constructor() {
    super();
    this.observable({
      items: [],
    });
  }

  calculateTotal() {
    let total = 0;
    let items = this.toJS().items ? this.toJS().items : [];
    for (let item of items) {
      let qty = +item.qty;
      if (typeof item.price !== 'string') {
        total = total + (+item.price * qty);
      }
    }
    return total;
  }

  saveCart() {
    let cart = this.toJS();
    storage.set('cart_items', cart.items);
  }

  loadCart() {
    this.items = storage.get('cart_items') ? storage.get('cart_items') : [];
  }

  clearItems() {
    this.items = [];
    this.saveCart();
  }

  addItem(product) {
    let found = this.items.find(item => {
      return item.id === product.id;
    });
    if (found) {
      found.qty = found.qty + 1;
    } else {
      this.items.push({
        ...product,
        qty: 1
      });
    }
    this.saveCart();
  }

  removeItem(product) {
    let found = this.items.find(item => {
      return item.id === product.id;
    });
    if (found) {
      if (found.qty > 1) {
        found.qty = found.qty - 1;
      } else {
        this.items.remove(found);
      }
    }
    this.saveCart();
  }

}

export default new CartStore();
