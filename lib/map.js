'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActMapEvt = ActMapEvt;
exports.EvtMapAct = EvtMapAct;
exports.UnmapEvt = UnmapEvt;
exports.ActionFilter = ActionFilter;

var _Observable = require('rxjs/Observable');

var _Scheduler = require('rxjs/Scheduler');

require('rxjs/add/observable/from');

var _func = require('./func');

var _func2 = _interopRequireDefault(_func);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ActMapEvt(driver, acts, evts) {
  var map = driver.map.act;

  if (!_func2.default.isArr(evts)) evts = [evts];
  if (!_func2.default.isArr(acts)) acts = [acts];

  evts.forEach(function (evt) {
    return acts.forEach(function (type) {
      if (_func2.default.isActFilter(type)) {
        type.install(evt);
        return;
      }
      type = _func2.default.getActionType(type, evt);
      if (!_func2.default.has(map, type)) {
        map[type] = {
          list: [evt],
          link: []
        };
        map[type].obsb = _Observable.Observable.from(map[type].list, _Scheduler.Scheduler.async);
      } else if (!_func2.default.has(map[type].list, evt)) map[type].push(evt);
    });
  });
}

function EvtMapAct(driver, evts, acts) {
  var map = driver.map.evt;

  if (!_func2.default.isArr(evts)) evts = [evts];
  if (!_func2.default.isArr(acts)) acts = [acts];

  evts.forEach(function (evt) {
    return acts.forEach(function (act) {
      if (!_func2.default.has(map, evt)) {
        map[evt] = { list: [act] };
        map[evt].obsb = _Observable.Observable.from(map[evt].list, _Scheduler.Scheduler.async);
      } else map[evt].list.push(act);
    });
  });
}

function UnmapEvt(driver, type, evt) {
  type = _func2.default.getActionType(type, evt);
  var i = driver.map.act[type].indexOf(evt);
  if (i !== -1) driver.map.act[type].splice(i, 1);
}

function ActionFilter(driver, func) {
  this.ActionFilter = true;
  this.func = func;
  this.install = function (evt) {
    driver.map.actFilter.list.push(function (data) {
      if (!func(data)) return false;
      return evt;
    });
  };
}