import { emitEvtRegister, handleEvtRegister, createEmitObs, createHandleObs } from './basic';

import F from './func';

const onDefaultOpts = { filter: () => true };
export function handle(driver, sets, options = onDefaultOpts) {
  options = F.assign(onDefaultOpts, options);

  F.forEach(sets, (acts, evt) => {
    acts = handleEvtRegister(driver, evt, acts);
    createHandleObs(driver, evt, acts, options.filter);
  });
}

const emitDefaultOpts = { bindProps: () => ({}), filter: () => true };
export function emit(driver, sets, options = emitDefaultOpts) {
  options = F.assign(emitDefaultOpts, options);

  F.forEach(sets, (acts, evt) => {
    emitEvtRegister(driver, evt, acts);
    createEmitObs(driver, evt, options.filter, options.bindProps);
  });
}

const routeDefaultOpts = {
  outFilter: () => true,
  outBind: () => { },
  inFilter: () => true,
  latestOnly: true,
  actionFilter: null
};

export const route = (driver, evt, sets, options = routeDefaultOpts) => {
  options = F.assign(routeDefaultOpts, options);

  const router = driver.$driverRouter;

  createEmitObs(driver, evt, options.outFilter, router.bindStamp(evt, options.outBind));

  const handleFilter = router.getRoutes(evt, {
    filter: options.inFilter,
    latestOnly: options.latestOnly
  });
  createHandleObs(driver, evt, null, handleFilter);

  let runResgister = true;
  if (options.actionFilter !== null) {
    options.actionFilter.setEvt(evt);
    driver.actFilters.push(options.actionFilter);
    runResgister = false;
  }

  sets.forEach((set) => {
    let types;

    let acts = set[0];
    if (!F.isArr(set[0])) acts = [acts];

    if (runResgister) types = emitEvtRegister(driver, evt, set[0]);
    else types = acts.map(act => F.getActionType(act, evt));

    router.setRoute(evt, types, set[1]);
  });
};
