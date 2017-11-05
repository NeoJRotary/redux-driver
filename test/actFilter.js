import { graphReq, reqAct } from './redux/actions';

export default (driver, store) => {
  driver.emitter(
    {
      graphReq: driver.actionFilter(act => act.graphql === true)
    },
    {
      evtFunc: obj => console.log('evtFunc', obj)
    }
  );

  store.dispatch(graphReq({ num: 10 }));
  store.dispatch(reqAct({ num: 10 }));
};
