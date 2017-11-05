'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.route = undefined;
exports.emit = emit;
exports.receive = receive;

var _func = require('./func');

var _func2 = _interopRequireDefault(_func);

var _map = require('./map');

var _event = require('./event');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function emit(driver, sets, options) {
  _func2.default.forEach(sets, function (acts, evt) {
    (0, _map.ActMapEvt)(driver, acts, evt);
    (0, _event.createEmitEvt)(driver, evt, options);
  });
} // import { emitEvtRegister, receiveEvtRegister, createEmitObs, createReceiveObs } from './basic';
function receive(driver, sets, options) {
  _func2.default.forEach(sets, function (acts, evt) {
    (0, _map.EvtMapAct)(driver, evt, acts);
    (0, _event.createReceiveEvt)(driver, evt, options);
  });
}

var routeDefault = {
  emitter: {},
  receiver: {},
  latestOnly: true
};

var route = exports.route = function route(driver, evt, sets) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : routeDefault;

  options = _func2.default.assign(routeDefault, options);
  var emitOpts = options.emitter;
  var receiveOtps = options.receiver;

  emitOpts.router = true;
  receiveOtps.router = true;
  receiveOtps.latestOnly = options.latestOnly;

  (0, _event.createEmitEvt)(driver, evt, emitOpts);
  (0, _event.createReceiveEvt)(driver, evt, receiveOtps);

  if (!_func2.default.isArr(sets)) sets = [sets];
  sets.forEach(function (set) {
    (0, _map.ActMapEvt)(driver, set.emitter, evt);
    driver.$driverRouter.setRoute(evt, set.emitter, set.receiver);
  });
};