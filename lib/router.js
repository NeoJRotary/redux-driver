'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Observable = require('rxjs/Observable');

var _Scheduler = require('rxjs/Scheduler');

require('rxjs/add/observable/from');

var _func = require('./func');

var _func2 = _interopRequireDefault(_func);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.default = function () {
  var r = {
    i: 0,
    stamps: [],
    events: {}
  };

  r.newStamp = function (evt, type) {
    var i = r.i;

    r.i += 1;
    if (r.i >= 10000) r.i = 0;
    r.stamps[i] = type;
    r.events[evt][type].i = i;
    return { $reduxDriverStamp: i };
  };

  r.getStamp = function (i) {
    var type = r.stamps[i];
    delete r.stamps[i];
    return type;
  };

  r.setRoute = function (evt, types, acts) {
    if (!_func2.default.isArr(types)) types = [types];
    if (!_func2.default.isArr(acts)) acts = [acts];
    types = types.map(function (act) {
      return _func2.default.getActionType(act, evt);
    });

    if (!_func2.default.isObj(r.events[evt])) r.events[evt] = {};
    var revt = r.events[evt];

    types.forEach(function (type) {
      var _revt$type$list;

      if (!_func2.default.isObj(revt[type])) {
        revt[type] = {
          i: -1,
          list: [].concat(_toConsumableArray(acts))
        };
        revt[type].obsb = _Observable.Observable.from(revt[type].list, _Scheduler.Scheduler.async);
      } else (_revt$type$list = revt[type].list).push.apply(_revt$type$list, _toConsumableArray(acts));
    });
  };

  r.bindStamp = function (evt, bind) {
    return function (store, obj) {
      return _func2.default.assign({}, bind(store), r.newStamp(evt, obj.type));
    };
  };

  r.getRoutes = function (evt, data, latestOnly) {
    var i = Number(data.$reduxDriverStamp);
    delete data.$reduxDriverStamp;
    if (Number.isNaN(i)) return undefined;

    var type = r.getStamp(i);
    var revt = r.events[evt][type];
    if (revt.i > i && latestOnly) return undefined;
    return revt.obsb;
  };

  return r;
};