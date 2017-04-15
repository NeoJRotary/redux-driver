'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Rx = require('rxjs/Rx');

exports.default = function () {
  var driver = {
    outList: {},
    inList: {},
    obs: {}
  };

  driver.connect = function (store, socket, actions) {
    driver.socket = socket;
    driver.store = store;
    driver.actions = actions;
  };

  driver.out = function (evt) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var arr = type;
    if (typeof evt !== 'string') {
      arr = evt;
      if (type.constructor === {}.constructor) options = type;
    }
    if (!Array.isArray(arr)) return;
    if (arr.length === 0) return;

    arr.forEach(function (v) {
      if (typeof v !== 'string') return;
      if (!Object.prototype.hasOwnProperty.call(driver.actions, v)) return; // no action
      var actType = driver.actions[v]().type;
      if (!Object.prototype.hasOwnProperty.call(driver.outList, actType)) {
        driver.outList[actType] = [];
      }
      if (typeof evt !== 'string') driver.outList[actType].push(v);else driver.outList[actType].push(evt);
    });

    var binder = {};
    if (typeof options.bindProps === 'function') {
      if (options.bindProps(driver.store.getState()).constructor !== {}.constructor) return; // not object
      binder = options.bindProps;
    } else if (_typeof(options.bindProps) === 'object') {
      if (options.bindProps.constructor !== {}.constructor) return; // not object
      binder = function binder() {
        return options.bindProps;
      };
    }

    if (!Array.isArray(evt)) evt = [evt];
    evt.forEach(function (v) {
      if (typeof binder === 'function') {
        driver.obs[v] = _Rx.Observable.create(function (obs) {
          obs.next(function (x) {
            var props = binder(driver.store.getState());
            driver.socket.emit(v, Object.assign(x, props));
          });
        });
      } else {
        driver.obs[v] = _Rx.Observable.create(function (obs) {
          obs.next(function (x) {
            driver.socket.emit(v, x);
          });
        });
      }
    });
  };

  driver.in = function (evt) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (typeof evt !== 'string') {
      if (!Array.isArray(evt)) return;
      if (evt.length === 0) return;
      evt.forEach(function (v) {
        if (typeof v !== 'string') return;
        if (!Object.prototype.hasOwnProperty.call(driver.inList, v)) driver.inList[v] = [v];
        var obs = _Rx.Observable.fromEventPattern(function (h) {
          driver.socket.on(v, h);
        });
        obs.subscribe(function (data) {
          return driver.store.dispatch(driver.actions[v](data));
        });
      });
    } else {
      if (!Array.isArray(type)) return;
      if (type.length === 0) return;
      type.forEach(function (v) {
        if (typeof v !== 'string') return;
        if (!Object.prototype.hasOwnProperty.call(driver.inList, v)) driver.inList[v] = [evt];else driver.inList[v].push(evt);
        var obs = _Rx.Observable.fromEventPattern(function (h) {
          driver.socket.on(evt, h);
        });

        if (typeof options.filter === 'undefined') {
          obs.subscribe(function (data) {
            driver.store.dispatch(driver.actions[v](data));
          });
        } else if (typeof options.filter === 'function') {
          obs.subscribe(function (data) {
            var bool = options.filter(data, driver.actions[v]({}), v);
            if (typeof bool !== 'boolean') return;
            if (bool) driver.store.dispatch(driver.actions[v](data));
          });
        }
      });
    }
  };

  driver.trigger = function (action) {
    if (!Object.prototype.hasOwnProperty.call(driver.outList, action.type)) return;
    driver.outList[action.type].forEach(function (evt) {
      driver.obs[evt].subscribe(function (emit) {
        return emit(action);
      });
    });
  };

  driver.middleware = function () {
    return function () {
      return function (next) {
        return function (action) {
          driver.trigger(action);
          return next(action);
        };
      };
    };
  };

  return driver;
};
