# redux-driver
>Event-Driven Middleware for Redux with RxJS and Socket.IO

Now just hard code testing with [socket.io](https://github.com/socketio/socket.io).   
Will support RxJS only in future.

### Install
This has peer dependencies of `rxjs: ^5.0.0`.   
`npm install --save redux-driver`

### driver.out(params)
> multi actions trigger same server event

params = ( 'event name string', [Actions Name Array] )
> each actions trigger server event in same name

params = ( [Actions Name Array] )

### driver.in(params, _filter_)
> dispatch multi actions in a client event

params = ( 'event name string', [Actions Name Array] )
> dispatch each actions in client event with same name

params = ( [Actions Name Array] )
> use filter to decide dispatch or not

```
filter = function(dataFromServer, actionObject, actionName) {
  // must return boolean
  return true;
}
```

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

driver.out('setData', ['setProduct', 'setTag']);
driver.in('getData', ['getProduct', 'getTag'], (data, action) => {
  return data.table === action.table;
});
```

Welcome anyone to join this project : )
