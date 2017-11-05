import { Observable } from 'rxjs/Observable';
import { ActionFilter } from './map';

const F = {};

F.isStr = obj => typeof obj === 'string';
F.isObj = obj => (obj !== undefined ? obj.constructor === {}.constructor : false);
F.isFunc = obj => typeof obj === 'function';
F.isArr = obj => Array.isArray(obj);
F.isObs = obj => obj instanceof Observable;
F.Undefined = obj => obj === undefined;
F.isActFilter = func => func instanceof ActionFilter;
F.has = (obj, key) => {
  if (F.isArr(obj)) return obj.indexOf(key) !== -1;
  if (F.isObj(obj)) return Object.prototype.hasOwnProperty.call(obj, key);
  return undefined;
};
F.keys = obj => Object.keys(obj);
F.assign = (...obj) => Object.assign({}, ...obj);
F.pick = (obj, keys) => {
  const result = {};
  keys.forEach((k) => {
    if (F.has(obj, k)) result[k] = obj[k];
  });
  return result;
};
F.forEach = (obj, callback) => Object.keys(obj).forEach(key => callback(obj[key], key));

F.getActionType = (act, evt) => {
  if (F.isStr(act)) return act;
  if (!F.isFunc(act)) {
    console.error(`${evt} has action which is not a function`);
    return null;
  }
  const actObj = act();
  if (!F.isObj(actObj)) {
    console.error(`${evt} has action(${act.name}) return value which is not a valid object`);
    return null;
  }
  if (!F.has(actObj, 'type')) {
    console.error(`${evt} has action(${act.name}) return value which doesn't have key 'type'`);
    return null;
  }
  return actObj.type;
};

export default F;
