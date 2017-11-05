'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _func = require('./func');

var _func2 = _interopRequireDefault(_func);

var _transfer = require('./transfer');

var _basic = require('./basic');

var _map = require('./map');

var _event = require('./event');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var driver = {
    socketIO: null,
    store: null,
    map: {
      act: {},
      evt: {},
      actFilter: {}
    },
    events: {
      emit: {},
      receive: {}
    },
    $driverRouter: {}
  };
  (0, _basic.init)(driver);

  driver.emitter = function (sets, options) {
    return (0, _transfer.emit)(driver, sets, options);
  };
  driver.receiver = function (sets, options) {
    return (0, _transfer.receive)(driver, sets, options);
  };
  driver.trigger = function (evt, data) {
    return (0, _basic.evtTrigger)(driver, evt, data);
  };
  driver.linkEvents = function (evtA, evtB) {
    return (0, _event.linkEvents)(driver, evtA, evtB);
  };
  driver.router = function (evt, sets, options) {
    return (0, _transfer.route)(driver, evt, sets, options);
  };

  driver.actionFilter = function (func) {
    return new _map.ActionFilter(driver, func);
  };

  driver.setup = function (obj) {
    if (_func2.default.has(obj, 'socketIO')) driver.socketIO = obj.socketIO;
  };

  driver.middleware = function () {
    return function (store) {
      return function (next) {
        return function (action) {
          if (driver.store === null) driver.store = store;

          (0, _basic.validActFilter)(driver, action);
          (0, _basic.ActTriggerEvt)(driver, action);

          // if (Object.prototype.hasOwnProperty.call(driver.trigList, action.type)) {
          //   driver.trigList[action.type].forEach((x) => {
          //     if (x.times !== 0) x.obs.subscribe(trig => trig(action));
          //   });
          // }

          // if (Object.prototype.hasOwnProperty.call(driver.middleList, action.type)) {
          //   driver.middleList[action.type].forEach(x => x.obs.subscribe(func => func(action)));
          // }

          return next(action);
        };
      };
    };
  };

  return driver;
};