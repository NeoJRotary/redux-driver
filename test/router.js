import { graphReq, graphRes } from './redux/actions';

export default (driver, store) => {
  function response(obj) {
    setTimeout(() => {
      driver.trigger('graphql', {
        $reduxDriverStamp: obj.$reduxDriverStamp,
        num: obj.num / 11
      });
    }, 100);
  }

  driver.router(
    'graphql',
    {
      emitter: graphReq,
      receiver: graphRes
    },
    {
      emitter: {
        beforeEmit: (obj) => {
          console.log('beforeEmit', obj);
          response(obj);
        }
      },
      receiver: {
        beforeDispatch: obj => console.log('beforeDispatch', obj)
      }
    }
  );

  store.dispatch(graphReq({ num: 11 }));
  store.dispatch(graphReq({ num: 22 }));
  store.dispatch(graphReq({ num: 33 }));

  setTimeout(() => store.dispatch(graphReq({ num: 44 })), 1000);
};
