import { Observable } from 'rxjs/Rx';

export default () => {
  const driver = {
    outList: {},
    inList: {},
    obs: {}
  };

  driver.connect = (store, socket, actions) => {
    driver.socket = socket;
    driver.store = store;
    driver.actions = actions;
  };

  driver.out = (evt, type = []) => {
    let arr = type;
    if (typeof evt !== 'string') arr = evt;
    if (!Array.isArray(arr)) return;
    if (arr.length === 0) return;

    arr.forEach((v) => {
      if (typeof v !== 'string') return;
      if (!Object.prototype.hasOwnProperty.call(driver.actions, v)) return; // no action
      const actType = driver.actions[v]().type;
      if (!Object.prototype.hasOwnProperty.call(driver.outList, actType)) {
        driver.outList[actType] = [];
      }
      if (typeof evt !== 'string') driver.outList[actType].push(v);
      else driver.outList[actType].push(evt);
    });

    if (Array.isArray(evt)) {
      evt.forEach((v) => {
        driver.obs[v] = Observable.create((obs) => {
          obs.next((x) => {
            driver.socket.emit(v, x);
          });
        });
      });
    } else {
      driver.obs[evt] = Observable.create((obs) => {
        obs.next((x) => {
          driver.socket.emit(evt, x);
        });
      });
    }
  };

  driver.in = (evt, type = [], filter) => {
    if (typeof evt !== 'string') {
      if (!Array.isArray(evt)) return;
      if (evt.length === 0) return;
      evt.forEach((v) => {
        if (typeof v !== 'string') return;
        if (!Object.prototype.hasOwnProperty.call(driver.inList, v)) driver.inList[v] = [v];
        const obs = Observable.fromEventPattern((h) => { driver.socket.on(v, h); });
        obs.subscribe(data => driver.store.dispatch(driver.actions[v](data)));
      });
    } else {
      if (!Array.isArray(type)) return;
      if (type.length === 0) return;
      type.forEach((v) => {
        if (typeof v !== 'string') return;
        if (!Object.prototype.hasOwnProperty.call(driver.inList, v)) driver.inList[v] = [evt];
        else driver.inList[v].push(evt);
        const obs = Observable.fromEventPattern((h) => { driver.socket.on(evt, h); });
        if (typeof filter === 'undefined') {
          obs.subscribe((data) => {
            driver.store.dispatch(driver.actions[v](data));
          });
        } else if (typeof filter === 'function') {
          obs.subscribe((data) => {
            const bool = filter(data, driver.actions[v]({}), v);
            if (typeof bool !== 'boolean') return;
            if (bool) driver.store.dispatch(driver.actions[v](data));
          });
        }
      });
    }
  };

  driver.trigger = (action) => {
    if (!Object.prototype.hasOwnProperty.call(driver.outList, action.type)) return;
    driver.outList[action.type].forEach((evt) => {
      driver.obs[evt].subscribe(emit => emit(action.data));
    });
  };

  driver.middleware = () => () => next => (action) => {
    driver.trigger(action);
    return next(action);
  };

  return driver;
};
