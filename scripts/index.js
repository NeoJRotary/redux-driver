import { Observable } from 'rxjs/Observable';
import { fromEventPattern } from 'rxjs/observable/fromEventPattern';

export default () => {
  const driver = {
    connected: false,
    actions: null,
    store: null,
    socket: null,
    outList: {},
    inList: {},
    trigList: {},
    middleList: {},
    outObs: {},
    inObs: {}
  };

  function debug(code, data) {
    switch (code) {
      case 0:
        throw new Error(`"${data}" shouldn't call before connect`);
      case 1:
        throw new Error('Event Name or Actions is not string or string-array');
      case 2:
        throw new Error('Event Name or Actions is empty array');
      case 3:
        throw new Error('options is not object');
      case 4:
        throw new Error(`Can't find Action "${data}" in connected Actions`);
      case 5:
        throw new Error('options.times is not valid positive integer');
      case 6:
        throw new Error('options.filter is not function or return invalid boolean');
      case 7:
        throw new Error('options.bindProps is not object or return invalid object');
      case 8:
        throw new Error('options.bindProps is not boolean');
      case 9:
        throw new Error('options.data is not object');
      case 10:
        throw new Error(`"${data} shouldn't call before connect to socket"`);
      case 11:
        throw new Error('middle function should be function');
      default:
    }
  }

  function validator(func, ...args) {
    if (!driver.connected) {
      if (func !== 'connect') debug(0, func);
      if (args[0] === null) debug(0, func);
      return;
    } else if (func === 'in' || func === 'out') {
      if (driver.socket === null) debug(10, func);
    }

    const objConst = {}.constructor;
    const evt = args[0];
    let acts = args[1];
    let options = args[2];
    if (func === 'middle') {
      const call = args[2];
      if (typeof call !== 'function') debug(11);
      options = args[3];
    }
    if (typeof evt !== 'string') {
      if (!Array.isArray(evt)) debug(1);
      if (acts.constructor === objConst) options = acts;
      acts = evt;
    }
    if (!Array.isArray(acts)) debug(1);
    if (options.constructor !== objConst) debug(3);
    if (func === 'trigger') {
      if (!Object.prototype.hasOwnProperty.call(driver.actions, evt)) debug(4);
    }
    for (let i = 0; i < acts.length; i += 1) {
      if (typeof acts[i] !== 'string') debug(1);
      if (!Object.prototype.hasOwnProperty.call(driver.actions, acts[i])) debug(4);
    }
    const keys = Object.keys(options);
    for (let i = 0; i < keys.length; i += 1) {
      if (keys === 'times') {
        if (typeof options.times !== 'number') debug(5);
        if (options.times < 0) debug(5);
        if (options.times !== Math.floor(options.time)) debug(5);
      }
      if (keys === 'filter') {
        if (typeof options.filter !== 'function') debug(6);
        if (typeof options.filter() !== 'boolean') debug(6);
      }
      if (keys === 'bindProps') {
        if (typeof options.bindProps === 'function') {
          if (options.bindProps(driver.store.getState()).constructor === objConst) debug(7);
        } else if (options.bindProps.constructor !== objConst) debug(7);
      }
      if (keys === 'bindAction') {
        if (typeof options.bindAction !== 'boolean') debug(8);
      }
      if (keys === 'data') {
        if (options.data.constructor !== objConst) debug(9);
      }
    }
  }

  driver.connect = (actions = null, socket = null) => {
    validator('connect', actions, socket);
    driver.actions = actions;
    driver.socket = socket;
    driver.connected = true;
  };

  const outDefault = { bindProps: () => ({}), filter: () => true };
  driver.out = (evt, acts = [], options = outDefault) => {
    validator('out', evt, acts, options);
    options = Object.assign({}, outDefault, options);
    const set = [];
    if (Array.isArray(evt)) {
      if (acts.constructor === {}.constructor) options = Object.assign({}, options, acts);
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
            driver.socket.emit(x.evt, Object.assign({}, y, props));
          }
        });
        obs.complete();
      });
    });
  };

  const inDefault = { filter: () => true };
  driver.in = (evt, acts = [], options = inDefault) => {
    validator('in', evt, acts, options);
    options = Object.assign({}, inDefault, options);
    const set = [];
    if (Array.isArray(evt)) {
      if (acts.constructor === {}.constructor) options = Object.assign({}, options, acts);
      evt.forEach(v => set.push({ evt: v, acts: [v] }));
    } else set.push({ evt, acts });

    set.forEach((x) => {
      if (!Object.prototype.hasOwnProperty.call(driver.inList, x.evt)) {
        driver.inList[x.evt] = [];
        driver.inObs[x.evt] = fromEventPattern((h) => { driver.socket.on(x.evt, h); });
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
    validator('trigger', act, target, options);
    options = Object.assign({}, trigDefault, options);
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
          if (options.bindAction) data = Object.assign({}, x, data);
          target.forEach(v => driver.store.dispatch(driver.actions[v](data)));
          trigObj.times -= 1;
        }
      });
      if (trigObj.times === 0) delete trigObj.obs;
      obs.complete();
    });

    driver.trigList[act].push(trigObj);
  };

  const middleDefault = { filter: () => true };
  driver.middle = (act, target = [], func, options = middleDefault) => {
    validator('middle', act, target, func, options);
    options = Object.assign({}, middleDefault, options);
    act = driver.actions[act]().type;
    if (!Object.prototype.hasOwnProperty.call(driver.middleList, act)) driver.middleList[act] = [];
    const midObj = { target };

    midObj.obs = Observable.create((obs) => {
      obs.next((x) => {
        const bool = options.filter(x);
        if (bool) {
          let data = func(x);
          if (typeof data.then !== 'function') {
            data = new Promise(resolve => resolve(func()));
          }
          data.then((val) => {
            target.forEach(v => driver.store.dispatch(driver.actions[v](val)));
          }, (err) => {
            console.log('driver.middle promise err: ', err);
          });
        }
      });
    });
    driver.middleList[act].push(midObj);
  };

  driver.middleware = () => store => next => (action) => {
    if (driver.store === null) driver.store = store;
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

    if (Object.prototype.hasOwnProperty.call(driver.middleList, action.type)) {
      driver.middleList[action.type].forEach(x => x.obs.subscribe(func => func(action)));
    }

    return next(action);
  };

  return driver;
};
