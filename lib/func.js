'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Observable = require('rxjs/Observable');

var _map = require('./map');

var F = {};

F.isStr = function (obj) {
  return typeof obj === 'string';
};
F.isObj = function (obj) {
  return obj !== undefined ? obj.constructor === {}.constructor : false;
};
F.isFunc = function (obj) {
  return typeof obj === 'function';
};
F.isArr = function (obj) {
  return Array.isArray(obj);
};
F.isObs = function (obj) {
  return obj instanceof _Observable.Observable;
};
F.Undefined = function (obj) {
  return obj === undefined;
};
F.isActFilter = function (func) {
  return func instanceof _map.ActionFilter;
};
F.has = function (obj, key) {
  if (F.isArr(obj)) return obj.indexOf(key) !== -1;
  if (F.isObj(obj)) return Object.prototype.hasOwnProperty.call(obj, key);
  return undefined;
};
F.keys = function (obj) {
  return Object.keys(obj);
};
F.assign = function () {
  for (var _len = arguments.length, obj = Array(_len), _key = 0; _key < _len; _key++) {
    obj[_key] = arguments[_key];
  }

  return Object.assign.apply(Object, [{}].concat(obj));
};
F.pick = function (obj, keys) {
  var result = {};
  keys.forEach(function (k) {
    if (F.has(obj, k)) result[k] = obj[k];
  });
  return result;
};
F.forEach = function (obj, callback) {
  return Object.keys(obj).forEach(function (key) {
    return callback(obj[key], key);
  });
};

F.getActionType = function (act, evt) {
  if (F.isStr(act)) return act;
  if (!F.isFunc(act)) {
    console.error(evt + ' has action which is not a function');
    return null;
  }
  var actObj = act();
  if (!F.isObj(actObj)) {
    console.error(evt + ' has action(' + act.name + ') return value which is not a valid object');
    return null;
  }
  if (!F.has(actObj, 'type')) {
    console.error(evt + ' has action(' + act.name + ') return value which doesn\'t have key \'type\'');
    return null;
  }
  return actObj.type;
};

exports.default = F;