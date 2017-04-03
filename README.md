# redux-driver
Event-Driven Middleware for Redux with RxJS

Now just hard code testing with [socket.io](https://github.com/socketio/socket.io)   
Request from client `driver.out('eventname', [Actions])`   
Response/Push from server `driver.in('eventname', [Actions])`   
```
import R from 'ramda';
import reduxDriver from 'redux-driver';
import { createStore, applyMiddleware } from 'redux';
import io from 'socket.io-client';
import reducers from './reducers';
import actions from './actions';


const driver = reduxDriver();
const socket = io('[SOCKETURL]', { transports: ['websocket'] });
const store = createStore(reducers, applyMiddleware(driver.middleware()));
driver.connect(store, socket, actions);

const acts = R.keys(actions);
const isSet = str => R.test(/^set/, str);
const isGet = str => R.test(/^get/, str);

driver.out('login', ['userLogin']);
driver.in('login', ['loginResult']);

driver.out('setData', R.filter(isSet, acts));
driver.in('getData', R.filter(isGet, acts));
```
