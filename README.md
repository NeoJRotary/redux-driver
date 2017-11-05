# **redux-driver** 1.0.0
Event-Driven / Action-Mapping Middleware for Redux with RxJS   
[![NPM version](http://img.shields.io/npm/v/redux-driver.svg?style=flat-square)](https://www.npmjs.org/package/redux-driver)

## Install
This has peer dependencies of `rxjs: ^5.3.0`.   
`npm i -S redux-driver`

## Concept Intro   
```
Act -|                            |- Act
Act -|-- Evt --> {HTTP} --> Evt --|- Act
Act -|                            |- Act
```
- Map actions to events, dispatch actions from events.
- Use events to manage http request/response.
- Split http request out from data flow.
- Split actions relationship mapping out from reducers.

## Bind with socket.io 
By `driver.setup({ SocketIO: socketObj })` driver can auto-binding with socket.io's event.   

## Methods
Please read [Docs](https://github.com/NeoJRotary/redux-driver/blob/master/documents/methods.md)
   
## What's Next
- Expand more RxJS features at event layer (delay, concat, take, etc).
- Support directly AJAX by this module.
- Add methods in old version back. (trigger, middle in 0.2.7)

## Example
With Socket.io
```
import reduxDriver from 'redux-driver';
import { createStore, applyMiddleware } from 'redux';
import io from 'socket.io-client';
import reducers from './reducers';

import { userLogin, loginResult, graphReq, graphRes } from './actions/user';

const driver = reduxDriver();
const socket = io('www.domain.com', { transports: ['websocket'] });
const store = createStore(reducers, applyMiddleware(driver.middleware()));

driver.setup({ socketIO: socket });

driver.emitter({ userLogin });
driver.receiver({ loginResult });

driver.router('graphql',
  {
    emitter: graphReq,
    receiver: graphRes
  }
);
```
Other examples you can take a look at our test scripts.

***

### Welcome anyone join this project : )
