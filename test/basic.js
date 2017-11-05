import { reqAct, resAct } from './redux/actions';

export default (driver, store) => {
  driver.emitter({ reqAct }, {
    evtFunc: obj => console.log('evtFunc', obj)
  });
  driver.receiver({ resAct }, {
    beforeDispatch: obj => console.log('beforeDispatch', obj)
  });
  driver.linkEvents('reqAct', 'resAct');

  store.dispatch(reqAct({ num: 10 }));
};
