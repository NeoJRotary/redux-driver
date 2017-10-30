# **redux-driver** 1.0.0-beta
Event/Action-Driven Middleware for Redux with RxJS and optional Socket.IO function.

[![NPM version](http://img.shields.io/npm/v/redux-driver.svg?style=flat-square)](https://www.npmjs.org/package/redux-driver)

## Install
This has peer dependencies of `rxjs: ^5.3.0`.   
`npm i -S redux-driver@beta`

## Methods
   
### **setup({ object })**
```
{
  socketIO // socket object
}
```
   
****
   
### **emitter(sets, _options_)**

- sets : object   
```
{
  [event name]: (action type string / action function)
}
```

- options : object   
```
{
  filter // function return boolean
  bindProps // funciton return object
}
```

**filter** : `(action) => { return boolean; }`   
\- action : action object  

**bindProps** : `(store) => { return {}; }`   
\- store : redux storage

****
   
### **handler(sets, _options_)**

- sets : object   
```
{
  [event name]: (action function)
}
```

- options : object   
```
{
  filter // function return boolean
}
```

**filter** : `(data) => { return boolean; }`   
\- data : data from receiver  

****
      
### **router(eventName, sets, _options_)**

- eventName: string

- sets : array of array   
```
[
  [ (emitter action), (handler action) ]
]
```

- options : object   
```
{
  actionFilter // driver actionFilter object
  latestOnly // only dispatch latest response
}
```

**actionFilter** : `driver.actionFilter(act => { return boolean })`   
\- global filter   
\- latestOnly : boolean. defualt true

****
## Example
```
import reduxDriver from 'redux-driver';
import { createStore, applyMiddleware } from 'redux';
import io from 'socket.io-client';
import reducers from './reducers';

import { userLogin, loginResult, graphTest, graphGet } from './actions/user';

const driver = reduxDriver();
const socket = io('[SOCKETURL]', { transports: ['websocket'] });
const store = createStore(reducers, applyMiddleware(driver.middleware()));

driver.setup({ socketIO: socket });

driver.emitter({ userLogin });
driver.handler({ loginResult });

driver.router('graphql',
  [
    [graphTest, graphGet]
  ],
  {
    actionFilter: driver.actionFilter(act => act.graphql === true)
  }
);

```

Welcome anyone to join this project : )
