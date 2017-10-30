import { Observable } from 'rxjs/Observable';
import { fromEventPattern } from 'rxjs/observable/fromEventPattern';

import F from './func';

export function ActionFilter(func) {
  this.evt = null;
  this.func = func;
  this.setEvt = evt => {
    this.evt = evt;
  };
  this.valid = obj => {
    if (this.func(obj)) return this.evt;
    return null;
  };
}

export function emitEvtRegister(driver, evt, acts) {
  const evtList = driver.emitter;
  const typeList = [];

  if (acts instanceof ActionFilter) {
    acts.setEvt(evt);
    driver.actFilters.push(acts);
  } else {
    if (!F.isArr(acts)) acts = [acts];
    acts.forEach(type => {
      type = F.getActionType(type, evt);
      if (!F.has(evtList, type)) evtList[type] = [evt];else evtList[type].push(evt);
      typeList.push(type);
    });
  }

  return typeList;
}

export function handleEvtRegister(driver, evt, acts) {
  const evtList = driver.handler;

  if (!F.isArr(acts)) acts = [acts];
  if (!F.has(evtList, evt)) evtList[evt] = acts;else evtList[evt].push(...acts);

  return acts;
}

export function createEmitObs(driver, evt, filter, bindProps) {
  const obsObj = Observable.create(obs => {
    obs.next(actObj => {
      if (filter(actObj)) {
        const props = bindProps(driver.store.getState(), actObj);
        driver.socketIO.emit(evt, F.assign(actObj, props));
      }
    });
    obs.complete();
  });
  driver.Observables.emitter[evt] = obsObj;
}

export function createHandleObs(driver, evt, acts, filter) {
  const obsObj = fromEventPattern(h => {
    driver.socketIO.on(evt, h);
  });

  if (F.isArr(acts)) {
    // common handler
    acts.forEach(act => {
      obsObj.subscribe(data => {
        const bool = filter(data);
        if (bool) driver.store.dispatch(act(data));
      });
    });
  } else {
    // route
    obsObj.subscribe(data => {
      const actList = filter(data);
      actList.forEach(act => driver.store.dispatch(act(data)));
    });
  }

  driver.Observables.handler[evt] = obsObj;
}