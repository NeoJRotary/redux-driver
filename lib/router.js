import F from './func';

export default (() => {
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

  r.getStamp = i => {
    const type = r.stamps[i];
    delete r.stamps[i];
    return type;
  };

  r.setRoute = (evt, types, acts) => {
    if (!F.isArr(types)) types = [types];
    if (!F.isArr(acts)) acts = [acts];

    if (!F.isObj(r.events[evt])) r.events[evt] = {};
    const revt = r.events[evt];

    types.forEach(type => {
      if (!F.isObj(revt[type])) {
        revt[type] = {
          i: -1,
          list: [...acts]
        };
      } else revt[type].list.push(...acts);
    });
  };

  r.bindStamp = (evt, bind) => (store, obj) => F.assign({}, bind(store), r.newStamp(evt, obj.type));

  r.getRoutes = (evt, opts) => data => {
    if (!opts.filter(data)) return [];

    const i = Number(data.$reduxDriverStamp);
    delete data.$reduxDriverStamp;
    if (Number.isNaN(i)) return [];

    const type = r.getStamp(i);
    const revt = r.events[evt][type];
    if (revt.i > i && opts.latestOnly) return [];

    return revt.list;
  };

  return r;
});