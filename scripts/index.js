import { Observable } from 'rxjs/Rx';

export default () => {
  const driver = {
    connected: false,
    outList: {},
    inList: {},
    trigList: {},
    outObs: {},
    inObs: {}
  };

  function debug(code, data) {
    switch (code) {
      case 0:
        console.error('in/out shouldn\'t call before connect');
        break;
      case 1:
        console.error('Event Name or Actions is not string or string-array');
        break;
      case 2:
        console.error('Event Name or Actions is empty array');
        break;
      case 3:
        console.error('options is not object');
        break;
      case 4:
        console.error(`Can't find Action "${data}" in connected Actions`);
        break;
      case 5:
        console.error('options.times is not valid positive integer');
        break;
      case 6:
        console.error('options.filter is not function or return invalid boolean');
        break;
      case 7:
        console.error('options.bindProps is not object or return invalid object');
        break;
      case 8:
        console.error('options.bindProps is not boolean');
        break;
      case 9:
        console.error('options.data is not object');
        break;
      default:
    }
    return false;
  }

  function validator(func, ...args) {
    if (!driver.connected) return debug(0);
    const objConst = {}.constructor;
    const evt = args[0];
    let acts = args[1];
    let options = args[2];
    if (typeof evt !== 'string') {
      if (!Array.isArray(evt)) return debug(1);
      if (acts.constructor === objConst) options = acts;
      acts = evt;
    }
    if (!Array.isArray(acts)) return debug(1);
    if (options.constructor !== objConst) return debug(3);
    if (func === 'trigger') {
      if (!Object.prototype.hasOwnProperty.call(driver.actions, evt)) return debug(4);
    }
    for (let i = 0; i < acts.length; i += 1) {
      if (typeof acts[i] !== 'string') return debug(1);
      if (!Object.prototype.hasOwnProperty.call(driver.actions, acts[i])) return debug(4);
    }
    const keys = Object.keys(options);
    for (let i = 0; i < keys.length; i += 1) {
      if (keys === 'times') {
        if (typeof options.times !== 'number') return debug(5);
        if (options.times < 0) return debug(5);
        if (options.times !== Math.floor(options.time)) return debug(5);
      }
      if (keys === 'filter') {
        if (typeof options.filter !== 'function') return debug(6);
        if (typeof options.filter() !== 'boolean') return debug(6);
      }
      if (keys === 'bindProps') {
        if (typeof options.bindProps === 'function') {
          if (options.bindProps(driver.store.getState()).constructor === objConst) return debug(7);
        } else if (options.bindProps.constructor !== objConst) return debug(7);
      }
      if (keys === 'bindAction') {
        if (typeof options.bindAction !== 'boolean') return debug(8);
      }
      if (keys === 'data') {
        if (options.data.constructor !== objConst) return debug(9);
      }
    }
    return true;
  }

  driver.connect = (store, socket, actions) => {
    driver.socket = socket;
    driver.store = store;
    driver.actions = actions;
    driver.connected = true;
  };

  const outDefault = { bindProps: () => ({}), filter: () => true };
  driver.out = (evt, acts = [], options = outDefault) => {
    if (!validator('out', evt, acts, options)) return;
    options = Object.assign(outDefault, options);
    const set = [];
    if (Array.isArray(evt)) {
      if (acts.constructor === {}.constructor) options = Object.assign(options, acts);
      evt.forEach(v => set.push({ evt: v, acts: [v] }));
    } else set.push({ evt, acts });

    set.forEach((x) => {
      x.acts.forEach((v) => {
        const actType = driver.actions[v]().type;
        if (!Object.prototype.hasOwnProperty.call(driver.outList, actType)) {
          driver.outList[actType] = [x.evt];
        } else driver.outList[actType].push(x.evt);
      });

      driver.outObs[x.evt] = Observable.create((obs) => {
        obs.next((y) => {
          if (options.filter(y)) {
            const props = options.bindProps(driver.store.getState());
            driver.socket.emit(x.evt, Object.assign(y, props));
          }
        });
        obs.complete();
      });
    });
  };

  const inDefault = { filter: () => true };
  driver.in = (evt, acts = [], options = inDefault) => {
    if (!validator('in', evt, acts, options)) return;
    options = Object.assign(inDefault, options);
    const set = [];
    if (Array.isArray(evt)) {
      if (acts.constructor === {}.constructor) options = Object.assign(options, acts);
      evt.forEach(v => set.push({ evt: v, acts: [v] }));
    } else set.push({ evt, acts });

    set.forEach((x) => {
      if (!Object.prototype.hasOwnProperty.call(driver.inList, x.evt)) {
        driver.inList[x.evt] = [];
        driver.inObs[x.evt] = Observable.fromEventPattern((h) => { driver.socket.on(x.evt, h); });
      }
      driver.inList[x.evt].concat(x.acts);
      x.acts.forEach((v) => {
        driver.inObs[x.evt].subscribe((data) => {
          const bool = options.filter(data, driver.actions[v]({}), v);
          if (bool) driver.store.dispatch(driver.actions[v](data));
        });
      });
    });
  };

  const trigDefault = { times: 1, filter: () => true, bindAction: false, data: {} };
  driver.trigger = (act, target = [], options = trigDefault) => {
    if (!validator('trigger', act, target, options)) return;
    options = Object.assign(trigDefault, options);
    act = driver.actions[act]().type;
    if (!Object.prototype.hasOwnProperty.call(driver.trigList, act)) driver.trigList[act] = [];
    const trigObj = {
      target,
      times: options.times
    };

    trigObj.obs = Observable.create((obs) => {
      obs.next((x) => {
        const bool = options.filter(x);
        if (bool) {
          let data = options.data;
          if (options.bindAction) data = Object.assign(x, data);
          target.forEach(v => driver.store.dispatch(driver.actions[v](data)));
          trigObj.times -= 1;
        }
      });
      if (trigObj.times === 0) delete trigObj.obs;
      obs.complete();
    });

    driver.trigList[act].push(trigObj);
  };

  driver.middleware = () => () => next => (action) => {
    if (Object.prototype.hasOwnProperty.call(driver.outList, action.type)) {
      driver.outList[action.type].forEach((evt) => {
        driver.outObs[evt].subscribe(emit => emit(action));
      });
    }

    if (Object.prototype.hasOwnProperty.call(driver.trigList, action.type)) {
      driver.trigList[action.type].forEach((x) => {
        if (x.times !== 0) x.obs.subscribe(trig => trig(action));
      });
    }
    return next(action);
  };

  return driver;
};
