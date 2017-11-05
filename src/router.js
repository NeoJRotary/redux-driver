import { Observable } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import 'rxjs/add/observable/from';

import F from './func';

export default () => {
  const r = {
    i: 0,
    stamps: [],
    events: {}
  };

  r.newStamp = (evt, type) => {
    const { i } = r;
    r.i += 1;
    if (r.i >= 10000) r.i = 0;
    r.stamps[i] = type;
    r.events[evt][type].i = i;
    return { $reduxDriverStamp: i };
  };

  r.getStamp = (i) => {
    const type = r.stamps[i];
    delete r.stamps[i];
    return type;
  };

  r.setRoute = (evt, types, acts) => {
    if (!F.isArr(types)) types = [types];
    if (!F.isArr(acts)) acts = [acts];
    types = types.map(act => F.getActionType(act, evt));

    if (!F.isObj(r.events[evt])) r.events[evt] = {};
    const revt = r.events[evt];

    types.forEach((type) => {
      if (!F.isObj(revt[type])) {
        revt[type] = {
          i: -1,
          list: [...acts]
        };
        revt[type].obsb = Observable.from(revt[type].list, Scheduler.async);
      } else revt[type].list.push(...acts);
    });
  };

  r.bindStamp = (evt, bind) => (store, obj) => F.assign({}, bind(store), r.newStamp(evt, obj.type));

  r.getRoutes = (evt, data, latestOnly) => {
    const i = Number(data.$reduxDriverStamp);
    delete data.$reduxDriverStamp;
    if (Number.isNaN(i)) return undefined;

    const type = r.getStamp(i);
    const revt = r.events[evt][type];
    if (revt.i > i && latestOnly) return undefined;
    return revt.obsb;
  };

  return r;
};
