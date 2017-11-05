import F from './func';

// const spreadDefault = { times: null, filter: () => true, bindAction: false, bindProps: () => ({}) };
// export const spread = (driver, sets, options = trigDefault) => {
//   options = F.assign(trigDefault, options);

  
//   const trigObj = {
//     target,
//     times: options.times
//   };

//   trigObj.obs = Observable.create((obs) => {
//     obs.next((x) => {
//       const bool = options.filter(x);
//       if (bool) {
//         let data = options.bindProps(driver.store.getState());
//         if (options.bindAction) data = Object.assign({}, x, data);
//         target.forEach(v => driver.store.dispatch(driver.actions[v](data)));
//         if (trigObj.times !== null) trigObj.times -= 1;
//       }
//     });
//     if (trigObj.times === 0) delete trigObj.obs;
//     obs.complete();
//   });

//   driver.trigList[act].push(trigObj);
// };

//   const middleDefault = { filter: () => true };
//   driver.middle = (act, target = [], func, options = middleDefault) => {
//     // validator('middle', act, target, func, options);
//     options = Object.assign({}, middleDefault, options);
//     act = driver.actions[act]().type;
//     if (!Object.prototype.hasOwnProperty.call(driver.middleList, act)) driver.middleList[act] = [];
//     const midObj = { target };

//     midObj.obs = Observable.create((obs) => {
//       obs.next((x) => {
//         const bool = options.filter(x);
//         if (bool) {
//           let data = func(x, driver.store.getState());
//           if (typeof data.then !== 'function') {
//             data = new Promise(resolve => resolve(func()));
//           }
//           data.then((val) => {
//             target.forEach(v => driver.store.dispatch(driver.actions[v](val)));
//           }, (err) => {
//             console.error('driver.middle promise err: ', err);
//           });
//         }
//       });
//     });
//     driver.middleList[act].push(midObj);
//   };