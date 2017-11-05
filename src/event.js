import { Subject } from 'rxjs/Subject';

import { dispatch, EvtTriggerAct, evtTrigger, evtEmitter } from './basic';
import F from './func';

const emitDefault = {
  bindProps: () => ({}),
  filter: () => true,
  beforeEmit: () => { },
  skipSocketIO: false,
  router: false
};

export function createEmitEvt(driver, evt, options = emitDefault) {
  options = F.assign(emitDefault, options);
  const { filter, beforeEmit } = options;
  let { bindProps } = options;
  const { skipSocketIO, router } = options;

  if (router) {
    bindProps = driver.$driverRouter.bindStamp(evt, bindProps);
  }

  const subject = new Subject();
  subject.subscribe({
    next: (act) => {
      if (!filter(act)) return;
      act = F.assign(act, bindProps(driver.store.getState(), act));
      if (beforeEmit(act, evt) === false) return;
      evtEmitter(driver, evt, act, skipSocketIO);
    },
    error: () => { },
    complete: () => { }
  });

  const { emit } = driver.events;
  emit[evt] = { subject, link: [] };
}

const receiveDefault = {
  filter: () => true,
  beforeDispatch: () => { },
  skipSocketIO: false,
  router: false,
  latestOnly: true
};

export function createReceiveEvt(driver, evt, options = receiveDefault) {
  options = F.assign(receiveDefault, options);
  const { filter, beforeDispatch } = options;
  const { skipSocketIO, router, latestOnly } = options;

  const subject = new Subject();
  subject.subscribe({
    next: (data) => {
      if (!filter(data)) return;
      if (beforeDispatch(data, evt) === false) return;
      if (!router) EvtTriggerAct(driver, evt, data);
      else {
        const obsb = driver.$driverRouter.getRoutes(evt, data, latestOnly);
        if (F.Undefined(obsb)) return;
        obsb.subscribe(act => dispatch(driver, act, data));
      }
    },
    error: () => { },
    complete: () => { }
  });

  if (driver.socketIO !== null && !skipSocketIO) {
    driver.socketIO.on(evt, data => evtTrigger(driver, evt, data));
  }

  const { receive } = driver.events;
  receive[evt] = { subject };
}

export function linkEvents(driver, evtA, evtB) {
  const evtAObj = driver.events.emit[evtA];
  if (F.Undefined(evtAObj)) {
    console.error(`cannot link undefined event ${evtA}`);
    return;
  }
  if (F.Undefined(driver.events.receive[evtB])) {
    console.error(`cannot link undefined event ${evtB}`);
    return;
  }
  if (!F.has(evtAObj.link, evtB)) evtAObj.link.push(evtB);
}
