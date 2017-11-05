import { combineReducers } from 'redux';

export default combineReducers({
  test: (state = {}, act) => {
    switch (act.type) {
      case 'REQ':
        console.log('reducer REQ', act);
        break;
      case 'RES':
        console.log('reducer RES', act);
        break;
      case 'GRAPH_REQ':
        console.log('reducer GRAPH_REQ', act);
        break;
      case 'GRAPH_RES':
        console.log('reducer GRAPH_RES', act);
        break;
      default:
    }
    return state;
  }
});
