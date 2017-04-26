'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Observable = require('rxjs/Observable');

var _fromEventPattern = require('rxjs/observable/fromEventPattern');

exports.default = function () {
  var driver = {
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
        throw new Error('"' + data + '" shouldn\'t call before connect');
      case 1:
        throw new Error('Event Name or Actions is not string or string-array');
      case 2:
        throw new Error('Event Name or Actions is empty array');
      case 3:
        throw new Error('options is not object');
      case 4:
        throw new Error('Can\'t find Action "' + data + '" in connected Actions');
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
        throw new Error('"' + data + ' shouldn\'t call before connect to socket"');
      case 11:
        throw new Error('middle function should be function');
      default:
    }
  }

  function validator(func) {
    if (!driver.connected) {
      if (func !== 'connect') debug(0, func);
      if ((arguments.length <= 1 ? undefined : arguments[1]) === null) debug(0, func);
      return;
    } else if (func === 'in' || func === 'out') {
      if (driver.socket === null) debug(10, func);
    }

    var objConst = {}.constructor;
    var evt = arguments.length <= 1 ? undefined : arguments[1];
    var acts = arguments.length <= 2 ? undefined : arguments[2];
    var options = arguments.length <= 3 ? undefined : arguments[3];
    if (func === 'middle') {
      var call = arguments.length <= 3 ? undefined : arguments[3];
      if (typeof call !== 'function') debug(11);
      options = arguments.length <= 4 ? undefined : arguments[4];
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
    for (var i = 0; i < acts.length; i += 1) {
      if (typeof acts[i] !== 'string') debug(1);
      if (!Object.prototype.hasOwnProperty.call(driver.actions, acts[i])) debug(4);
    }
    var keys = Object.keys(options);
    for (var _i = 0; _i < keys.length; _i += 1) {
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

  driver.connect = function () {
    var actions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var socket = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    validator('connect', actions, socket);
    driver.actions = actions;
    driver.socket = socket;
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

    validator('out', evt, acts, options);
    options = Object.assign({}, outDefault, options);
    var set = [];
    if (Array.isArray(evt)) {
      if (acts.constructor === {}.constructor) options = Object.assign({}, options, acts);
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

      driver.outObs[x.evt] = _Observable.Observable.create(function (obs) {
        obs.next(function (y) {
          if (options.filter(y)) {
            var props = options.bindProps(driver.store.getState());
            driver.socket.emit(x.evt, Object.assign({}, y, props));
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

    validator('in', evt, acts, options);
    options = Object.assign({}, inDefault, options);
    var set = [];
    if (Array.isArray(evt)) {
      if (acts.constructor === {}.constructor) options = Object.assign({}, options, acts);
      evt.forEach(function (v) {
        return set.push({ evt: v, acts: [v] });
      });
    } else set.push({ evt: evt, acts: acts });

    set.forEach(function (x) {
      if (!Object.prototype.hasOwnProperty.call(driver.inList, x.evt)) {
        driver.inList[x.evt] = [];
        driver.inObs[x.evt] = (0, _fromEventPattern.fromEventPattern)(function (h) {
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
    }, bindAction: false, data: {} };
  driver.trigger = function (act) {
    var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : trigDefault;

    validator('trigger', act, target, options);
    options = Object.assign({}, trigDefault, options);
    act = driver.actions[act]().type;
    if (!Object.prototype.hasOwnProperty.call(driver.trigList, act)) driver.trigList[act] = [];
    var trigObj = {
      target: target,
      times: options.times
    };

    trigObj.obs = _Observable.Observable.create(function (obs) {
      obs.next(function (x) {
        var bool = options.filter(x);
        if (bool) {
          var data = options.data;
          if (options.bindAction) data = Object.assign({}, x, data);
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

  var middleDefault = { filter: function filter() {
      return true;
    } };
  driver.middle = function (act) {
    var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var func = arguments[2];
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : middleDefault;

    validator('middle', act, target, func, options);
    options = Object.assign({}, middleDefault, options);
    act = driver.actions[act]().type;
    if (!Object.prototype.hasOwnProperty.call(driver.middleList, act)) driver.middleList[act] = [];
    var midObj = { target: target };

    midObj.obs = _Observable.Observable.create(function (obs) {
      obs.next(function (x) {
        var bool = options.filter(x);
        if (bool) {
          var data = func(x);
          if (typeof data.then !== 'function') {
            data = new Promise(function (resolve) {
              return resolve(func());
            });
          }
          data.then(function (val) {
            target.forEach(function (v) {
              return driver.store.dispatch(driver.actions[v](val));
            });
          }, function (err) {
            console.log('driver.middle promise err: ', err);
          });
        }
      });
    });
    driver.middleList[act].push(midObj);
  };

  driver.middleware = function () {
    return function (store) {
      return function (next) {
        return function (action) {
          if (driver.store === null) driver.store = store;
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

          if (Object.prototype.hasOwnProperty.call(driver.middleList, action.type)) {
            driver.middleList[action.type].forEach(function (x) {
              return x.obs.subscribe(function (func) {
                return func(action);
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
