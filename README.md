# **redux-driver**
Event-Driven Middleware for Redux with RxJS and Socket.IO

[![NPM version](http://img.shields.io/npm/v/redux-driver.svg?style=flat-square)](https://www.npmjs.org/package/redux-driver)

Now just hard code testing with [socket.io](https://github.com/socketio/socket.io).   
Will support RxJS only in future.

## Install
This has peer dependencies of `rxjs: ^5.3.0`.   
`npm install --save redux-driver`

## Usage
### connect(store, socket, actions)
> Connect redux, socket.io and actions to module.

Must call before any in/out binding.

### out(params, _options_)
> Send action object to server

Multi actions trigger same server event :   
`params = ( 'event name string', [Actions Name Array] )`

Each actions trigger server event in same name :   
`params = ( [Actions Name Array] )`

### _options_
```
{
  bindProps: (state) => {}
}
```
**bindProps** : ( function return object or static object )    
\- state : redux store current state.  `store.getState()`  

Merge props to action object by `Object.assign` before emit to server. Useful for token binding. If set as function, it will be called before each emit.

### in(params, _options_)
> Get data from server

Dispatch multi actions in a client event :  
`params = ( 'event name string', [Actions Name Array] )`

Dispatch each actions in client event as same name :   
`params = ( [Actions Name Array] )`

### _options_
```
{
  filter: (data, action, actionName) => {}
}
```
**filter** : ( function return boolean )   
\- data : data from server   
\- action : object return from action function   
\- actionName : name of action function   

Add filter to decide dispatch action or not.

## Example
```
import reduxDriver from 'redux-driver';
import { createStore, applyMiddleware } from 'redux';
import io from 'socket.io-client';
import reducers from './reducers';
import actions from './actions';

const driver = reduxDriver();
const socket = io('[SOCKETURL]', { transports: ['websocket'] });
const store = createStore(reducers, applyMiddleware(driver.middleware()));

driver.connect(store, socket, actions);

driver.out(['userLogin', 'userSignup']);
driver.in(['loginResult', 'signupResult']);

driver.out('setData', ['setProduct', 'setTag'], {
  bindProps: (state) => ({
    token: state.user.token
  })
});


driver.in('getData', ['getProduct', 'getTag'], {
  filter: (data, action) => {
    return data.table === action.table;
  }
});
```

Welcome anyone to join this project : )
