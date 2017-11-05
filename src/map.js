import { Observable } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import 'rxjs/add/observable/from';

import F from './func';

export function ActMapEvt(driver, acts, evts) {
  const map = driver.map.act;

  if (!F.isArr(evts)) evts = [evts];
  if (!F.isArr(acts)) acts = [acts];

  evts.forEach(evt => acts.forEach((type) => {
    if (F.isActFilter(type)) {
      type.install(evt);
      return;
    }
    type = F.getActionType(type, evt);
    if (!F.has(map, type)) {
      map[type] = {
        list: [evt],
        link: []
      };
      map[type].obsb = Observable.from(map[type].list, Scheduler.async);
    } else if (!F.has(map[type].list, evt)) map[type].push(evt);
  }));
}

export function EvtMapAct(driver, evts, acts) {
  const map = driver.map.evt;

  if (!F.isArr(evts)) evts = [evts];
  if (!F.isArr(acts)) acts = [acts];

  evts.forEach(evt => acts.forEach((act) => {
    if (!F.has(map, evt)) {
      map[evt] = { list: [act] };
      map[evt].obsb = Observable.from(map[evt].list, Scheduler.async);
    } else map[evt].list.push(act);
  }));
}

export function UnmapEvt(driver, type, evt) {
  type = F.getActionType(type, evt);
  const i = driver.map.act[type].indexOf(evt);
  if (i !== -1) driver.map.act[type].splice(i, 1);
}

export function ActionFilter(driver, func) {
  this.ActionFilter = true;
  this.func = func;
  this.install = (evt) => {
    driver.map.actFilter.list.push((data) => {
      if (!func(data)) return false;
      return evt;
    });
  };
}
