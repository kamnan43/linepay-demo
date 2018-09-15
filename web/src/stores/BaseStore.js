import {extendObservable, toJS} from 'mobx';

export default class BaseStore {
  observable(state) {
    return extendObservable(this, state);
  }

  toJS() {
    return toJS(this);
  }
}
