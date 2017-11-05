'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEmitEvt = createEmitEvt;
exports.createReceiveEvt = createReceiveEvt;
exports.linkEvents = linkEvents;

var _Subject = require('rxjs/Subject');

var _basic = require('./basic');

var _func = require('./func');

var _func2 = _interopRequireDefault(_func);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var emitDefault = {
  bindProps: function bindProps() {
    return {};
  },
  filter: function filter() {
    return true;
  },
  beforeEmit: function beforeEmit() {},
  skipSocketIO: false,
  router: false
};

function createEmitEvt(driver, evt) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : emitDefault;

  options = _func2.default.assign(emitDefault, options);
  var _options = options,
      filter = _options.filter,
      beforeEmit = _options.beforeEmit;
  var _options2 = options,
      bindProps = _options2.bindProps;
  var _options3 = options,
      skipSocketIO = _options3.skipSocketIO,
      router = _options3.router;


  if (router) {
    bindProps = driver.$driverRouter.bindStamp(evt, bindProps);
  }

  var subject = new _Subject.Subject();
  subject.subscribe({
    next: function next(act) {
      if (!filter(act)) return;
      act = _func2.default.assign(act, bindProps(driver.store.getState(), act));
      if (beforeEmit(act, evt) === false) return;
      (0, _basic.evtEmitter)(driver, evt, act, skipSocketIO);
    },
    error: function error() {},
    complete: function complete() {}
  });

  var emit = driver.events.emit;

  emit[evt] = { subject: subject, link: [] };
}

var receiveDefault = {
  filter: function filter() {
    return true;
  },
  beforeDispatch: function beforeDispatch() {},
  skipSocketIO: false,
  router: false,
  latestOnly: true
};

function createReceiveEvt(driver, evt) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : receiveDefault;

  options = _func2.default.assign(receiveDefault, options);
  var _options4 = options,
      filter = _options4.filter,
      beforeDispatch = _options4.beforeDispatch;
  var _options5 = options,
      skipSocketIO = _options5.skipSocketIO,
      router = _options5.router,
      latestOnly = _options5.latestOnly;


  var subject = new _Subject.Subject();
  subject.subscribe({
    next: function next(data) {
      if (!filter(data)) return;
      if (beforeDispatch(data, evt) === false) return;
      if (!router) (0, _basic.EvtTriggerAct)(driver, evt, data);else {
        var obsb = driver.$driverRouter.getRoutes(evt, data, latestOnly);
        if (_func2.default.Undefined(obsb)) return;
        obsb.subscribe(function (act) {
          return (0, _basic.dispatch)(driver, act, data);
        });
      }
    },
    error: function error() {},
    complete: function complete() {}
  });

  if (driver.socketIO !== null && !skipSocketIO) {
    driver.socketIO.on(evt, function (data) {
      return (0, _basic.evtTrigger)(driver, evt, data);
    });
  }

  var receive = driver.events.receive;

  receive[evt] = { subject: subject };
}

function linkEvents(driver, evtA, evtB) {
  var evtAObj = driver.events.emit[evtA];
  if (_func2.default.Undefined(evtAObj)) {
    console.error('cannot link undefined event ' + evtA);
    return;
  }
  if (_func2.default.Undefined(driver.events.receive[evtB])) {
    console.error('cannot link undefined event ' + evtB);
    return;
  }
  if (!_func2.default.has(evtAObj.link, evtB)) evtAObj.link.push(evtB);
}