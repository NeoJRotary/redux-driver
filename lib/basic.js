'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.dispatch = dispatch;
exports.validActFilter = validActFilter;
exports.ActTriggerEvt = ActTriggerEvt;
exports.EvtTriggerAct = EvtTriggerAct;
exports.evtTrigger = evtTrigger;
exports.evtEmitter = evtEmitter;

var _Observable = require('rxjs/Observable');

var _Scheduler = require('rxjs/Scheduler');

require('rxjs/add/observable/from');

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _func = require('./func');

var _func2 = _interopRequireDefault(_func);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(driver) {
  var actFilter = driver.map.actFilter;

  actFilter.list = [];
  actFilter.obsb = _Observable.Observable.from(actFilter.list, _Scheduler.Scheduler.async);
  driver.$driverRouter = (0, _router2.default)();
}

function dispatch(driver, act, data) {
  driver.store.dispatch(act(data));
}

function validActFilter(driver, act) {
  driver.map.actFilter.obsb.subscribe(function (func) {
    var evt = func(act);
    if (evt === false) return;
    var subject = driver.events.emit[evt].subject;

    subject.next(act);
  });
}

function ActTriggerEvt(driver, act) {
  if (!_func2.default.has(driver.map.act, act.type)) return;
  driver.map.act[act.type].obsb.subscribe(function (evt) {
    var subject = driver.events.emit[evt].subject;

    subject.next(act);
  });
}

function EvtTriggerAct(driver, evt, data) {
  driver.map.evt[evt].obsb.subscribe(function (act) {
    return dispatch(driver, act, data);
  });
}

function evtTrigger(driver, evt, data) {
  var receive = driver.events.receive;

  if (_func2.default.Undefined(receive)) {
    console.error('cannot trigger undefined event ' + evt);
    return;
  }
  receive[evt].subject.next(data);
}

function evtEmitter(driver, evt, act, skipSocketIO) {
  if (driver.socketIO !== null && !skipSocketIO) driver.socketIO.emit(evt, act);
  var link = driver.events.emit[evt].link;

  link.forEach(function (e) {
    return evtTrigger(driver, e, act);
  });
}