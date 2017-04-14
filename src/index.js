'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

    var arr = type;
    if (typeof evt !== 'string') arr = evt;
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

    if (Array.isArray(evt)) {
      evt.forEach(function (v) {
        driver.obs[v] = _Rx.Observable.create(function (obs) {
          obs.next(function (x) {
            driver.socket.emit(v, x);
          });
        });
      });
    } else {
      driver.obs[evt] = _Rx.Observable.create(function (obs) {
        obs.next(function (x) {
          driver.socket.emit(evt, x);
        });
      });
    }
  };

  driver.in = function (evt) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var filter = arguments[2];

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
        if (typeof filter === 'undefined') {
          obs.subscribe(function (data) {
            driver.store.dispatch(driver.actions[v](data));
          });
        } else if (typeof filter === 'function') {
          obs.subscribe(function (data) {
            var bool = filter(data, driver.actions[v]({}), v);
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
