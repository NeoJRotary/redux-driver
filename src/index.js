import F from './func';

import { emit, receive, route } from './transfer';
import { init, validActFilter, ActTriggerEvt, evtTrigger } from './basic';
import { ActionFilter } from './map';
import { linkEvents } from './event';


export default () => {
  const driver = {
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
  init(driver);

  driver.emitter = (sets, options) => emit(driver, sets, options);
  driver.receiver = (sets, options) => receive(driver, sets, options);
  driver.trigger = (evt, data) => evtTrigger(driver, evt, data);
  driver.linkEvents = (evtA, evtB) => linkEvents(driver, evtA, evtB);
  driver.router = (evt, sets, options) => route(driver, evt, sets, options);

  driver.actionFilter = func => new ActionFilter(driver, func);

  driver.setup = (obj) => {
    if (F.has(obj, 'socketIO')) driver.socketIO = obj.socketIO;
  };

  driver.middleware = () => store => next => (action) => {
    if (driver.store === null) driver.store = store;

    validActFilter(driver, action);
    ActTriggerEvt(driver, action);

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
};
