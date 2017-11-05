import { Observable } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import 'rxjs/add/observable/from';

import driverRouter from './router';

import F from './func';

export function init(driver) {
  const { actFilter } = driver.map;
  actFilter.list = [];
  actFilter.obsb = Observable.from(actFilter.list, Scheduler.async);
  driver.$driverRouter = driverRouter();
}

export function dispatch(driver, act, data) {
  driver.store.dispatch(act(data));
}

export function validActFilter(driver, act) {
  driver.map.actFilter.obsb.subscribe((func) => {
    const evt = func(act);
    if (evt === false) return;
    const { subject } = driver.events.emit[evt];
    subject.next(act);
  });
}

export function ActTriggerEvt(driver, act) {
  if (!F.has(driver.map.act, act.type)) return;
  driver.map.act[act.type].obsb.subscribe((evt) => {
    const { subject } = driver.events.emit[evt];
    subject.next(act);
  });
}

export function EvtTriggerAct(driver, evt, data) {
  driver.map.evt[evt].obsb.subscribe(act => dispatch(driver, act, data));
}

export function evtTrigger(driver, evt, data) {
  const { receive } = driver.events;
  if (F.Undefined(receive)) {
    console.error(`cannot trigger undefined event ${evt}`);
    return;
  }
  receive[evt].subject.next(data);
}

export function evtEmitter(driver, evt, act, skipSocketIO) {
  if (driver.socketIO !== null && !skipSocketIO) driver.socketIO.emit(evt, act);
  const { link } = driver.events.emit[evt];
  link.forEach(e => evtTrigger(driver, e, act));
}
