import { createStore, applyMiddleware } from 'redux';
import reduxDriver from '../src';
import reducers from './redux/reducers';
import basic from './basic';
import router from './router';
import actFilter from './actFilter';

const unit = process.argv[2];
const driver = reduxDriver();
const store = createStore(reducers, applyMiddleware(driver.middleware()));

const task = { basic, actFilter, router };

if (unit !== undefined) {
  task[unit](driver, store);
}
