'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Rx = require('rxjs/Rx');

exports.default = function () {
  var driver = {
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
        console.error('Can\'t find Action "' + data + '" in connected Actions');
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

  function validator(func) {
    if (!driver.connected) return debug(0);
    var objConst = {}.constructor;
    var evt = arguments.length <= 1 ? undefined : arguments[1];
    var acts = arguments.length <= 2 ? undefined : arguments[2];
    var options = arguments.length <= 3 ? undefined : arguments[3];
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
    for (var i = 0; i < acts.length; i += 1) {
      if (typeof acts[i] !== 'string') return debug(1);
      if (!Object.prototype.hasOwnProperty.call(driver.actions, acts[i])) return debug(4);
    }
    var keys = Object.keys(options);
    for (var _i = 0; _i < keys.length; _i += 1) {
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

  driver.connect = function (store, socket, actions) {
    driver.socket = socket;
    driver.store = store;
    driver.actions = actions;
    driver.connected = true;
  };

  var outDefault = { bindProps: function bindProps() {
      return {};
    }, filter: function filter() {
      return true;
    } };
  driver.out = function (evt) {
    var acts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : outDefault;

    if (!validator('out', evt, acts, options)) return;
    options = Object.assign(outDefault, options);
    var set = [];
    if (Array.isArray(evt)) {
      if (acts.constructor === {}.constructor) options = Object.assign(options, acts);
      evt.forEach(function (v) {
        return set.push({ evt: v, acts: [v] });
      });
    } else set.push({ evt: evt, acts: acts });

    set.forEach(function (x) {
      x.acts.forEach(function (v) {
        var actType = driver.actions[v]().type;
        if (!Object.prototype.hasOwnProperty.call(driver.outList, actType)) {
          driver.outList[actType] = [x.evt];
        } else driver.outList[actType].push(x.evt);
      });

      driver.outObs[x.evt] = _Rx.Observable.create(function (obs) {
        obs.next(function (y) {
          if (options.filter(y)) {
            var props = options.bindProps(driver.store.getState());
            driver.socket.emit(x.evt, Object.assign(y, props));
          }
        });
        obs.complete();
      });
    });
  };

  var inDefault = { filter: function filter() {
      return true;
    } };
  driver.in = function (evt) {
    var acts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : inDefault;

    if (!validator('in', evt, acts, options)) return;
    options = Object.assign(inDefault, options);
    var set = [];
    if (Array.isArray(evt)) {
      if (acts.constructor === {}.constructor) options = Object.assign(options, acts);
      evt.forEach(function (v) {
        return set.push({ evt: v, acts: [v] });
      });
    } else set.push({ evt: evt, acts: acts });

    set.forEach(function (x) {
      if (!Object.prototype.hasOwnProperty.call(driver.inList, x.evt)) {
        driver.inList[x.evt] = [];
        driver.inObs[x.evt] = _Rx.Observable.fromEventPattern(function (h) {
          driver.socket.on(x.evt, h);
        });
      }
      driver.inList[x.evt].concat(x.acts);
      x.acts.forEach(function (v) {
        driver.inObs[x.evt].subscribe(function (data) {
          var bool = options.filter(data, driver.actions[v]({}), v);
          if (bool) driver.store.dispatch(driver.actions[v](data));
        });
      });
    });
  };

  var trigDefault = { times: 1, filter: function filter() {
      return true;
    }, bindAction: true, data: {} };
  driver.trigger = function (act) {
    var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : trigDefault;

    if (!validator('trigger', act, target, options)) return;
    options = Object.assign(trigDefault, options);
    act = driver.actions[act]().type;
    if (!Object.prototype.hasOwnProperty.call(driver.trigList, act)) driver.trigList[act] = [];
    var trigObj = {
      target: target,
      times: options.times
    };

    trigObj.obs = _Rx.Observable.create(function (obs) {
      obs.next(function (x) {
        var bool = options.filter(x);
        if (bool) {
          var data = options.data;
          if (options.bindAction) data = Object.assign(x, data);
          target.forEach(function (v) {
            return driver.store.dispatch(driver.actions[v](data));
          });
          trigObj.times -= 1;
        }
      });
      if (trigObj.times === 0) delete trigObj.obs;
      obs.complete();
    });

    driver.trigList[act].push(trigObj);
  };

  driver.middleware = function () {
    return function () {
      return function (next) {
        return function (action) {
          if (Object.prototype.hasOwnProperty.call(driver.outList, action.type)) {
            driver.outList[action.type].forEach(function (evt) {
              driver.outObs[evt].subscribe(function (emit) {
                return emit(action);
              });
            });
          }

          if (Object.prototype.hasOwnProperty.call(driver.trigList, action.type)) {
            driver.trigList[action.type].forEach(function (x) {
              if (x.times !== 0) x.obs.subscribe(function (trig) {
                return trig(action);
              });
            });
          }
          return next(action);
        };
      };
    };
  };

  return driver;
};
