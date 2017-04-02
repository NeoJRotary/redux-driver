import { Observable } from 'rxjs/Rx';

export default () => {
  const redurx = {
    outList: {},
    inList: {},
    obs: {}
  };

  redurx.connect = (store, socket, actions) => {
    redurx.socket = socket;
    redurx.store = store;
    redurx.actions = actions;
  };

  redurx.out = (evt, type = []) => {
    if (typeof evt !== 'string' || type.length === 0) return; // null data
    type.forEach((v) => {
      if (!Object.prototype.hasOwnProperty.call(redurx.actions, v)) return; // no action
      const actType = redurx.actions[v]().type;
      if (!Object.prototype.hasOwnProperty.call(redurx.outList, redurx.actions[v].type)) {
        redurx.outList[actType] = [];
      }
      redurx.outList[actType].push(evt);
    });

    redurx.obs[evt] = Observable.create((obs) => {
      obs.next((x) => {
        redurx.socket.emit(evt, x);
      });
    });
  };

  redurx.in = (evt, type = []) => {
    if (typeof evt !== 'string' || type.length === 0) return;
    type.forEach((v) => {
      if (!Object.prototype.hasOwnProperty.call(redurx.inList, v)) redurx.inList[v] = [evt];
      else redurx.inList[v].push(evt);

      const obs = Observable.fromEventPattern((h) => { redurx.socket.on(evt, h); });
      obs.subscribe((data) => {
        redurx.store.dispatch(redurx.actions[v](data));
      });
    });
  };

  redurx.trigger = (action) => {
    if (!Object.prototype.hasOwnProperty.call(redurx.outList, action.type)) return;
    redurx.outList[action.type].forEach((evt) => {
      redurx.obs[evt].subscribe(emit => emit(action.data));
    });
  };

  redurx.middleware = () => () => next => (action) => {
    redurx.trigger(action);
    return next(action);
  };

  return redurx;
};
