// import { emitEvtRegister, receiveEvtRegister, createEmitObs, createReceiveObs } from './basic';
import F from './func';
import { ActMapEvt, EvtMapAct } from './map';
import { createEmitEvt, createReceiveEvt } from './event';

export function emit(driver, sets, options) {
  F.forEach(sets, (acts, evt) => {
    ActMapEvt(driver, acts, evt);
    createEmitEvt(driver, evt, options);
  });
}

export function receive(driver, sets, options) {
  F.forEach(sets, (acts, evt) => {
    EvtMapAct(driver, evt, acts);
    createReceiveEvt(driver, evt, options);
  });
}

const routeDefault = {
  emitter: {},
  receiver: {},
  latestOnly: true
};

export const route = (driver, evt, sets, options = routeDefault) => {
  options = F.assign(routeDefault, options);
  const emitOpts = options.emitter;
  const receiveOtps = options.receiver;

  emitOpts.router = true;
  receiveOtps.router = true;
  receiveOtps.latestOnly = options.latestOnly;

  createEmitEvt(driver, evt, emitOpts);
  createReceiveEvt(driver, evt, receiveOtps);

  if (!F.isArr(sets)) sets = [sets];
  sets.forEach((set) => {
    ActMapEvt(driver, set.emitter, evt);
    driver.$driverRouter.setRoute(evt, set.emitter, set.receiver)
  });
};
