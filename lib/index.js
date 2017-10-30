import F from './func';

import { emit, handle, route } from './transfer';
import { ActionFilter } from './basic';
import driverRouter from './router';

export default (() => {
  const driver = {
    socketIO: null,
    store: null,
    emitter: {},
    handler: {},
    Observables: {
      emitter: {},
      handler: {}
    },
    actFilters: [],
    $driverRouter: driverRouter()
  };

  driver.subscribe = (evt, obj) => driver.Observables.emitter[evt].subscribe(e => e(obj));

  driver.emitter = (...args) => emit(driver, ...args);
  driver.handler = (...args) => handle(driver, ...args);
  driver.router = (...args) => route(driver, ...args);

  driver.actionFilter = func => new ActionFilter(func);

  driver.setup = obj => {
    if (F.has(obj, 'socketIO')) driver.socketIO = obj.socketIO;
  };

  driver.middleware = () => store => next => action => {
    if (driver.store === null) driver.store = store;

    driver.actFilters.forEach(actF => {
      const evt = actF.valid(action);
      if (evt !== null) driver.subscribe(evt, action);
    });

    if (F.has(driver.emitter, action.type)) {
      driver.emitter[action.type].forEach(evt => driver.subscribe(evt, action));
    }

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

  return driver;
});