const F = {};

F.isStr = obj => typeof obj === 'string';
F.isObj = obj => (obj !== undefined ? obj.constructor === {}.constructor : false);
F.isFunc = obj => typeof obj === 'function';
F.isArr = obj => Array.isArray(obj);
F.has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
F.keys = obj => Object.keys(obj);
F.assign = (...obj) => Object.assign({}, ...obj);
F.forEach = (obj, callback) => Object.keys(obj).forEach(key => callback(obj[key], key));

F.getActionType = (act, evt) => {
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
