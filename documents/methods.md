# Methods  
### **setup({ object })**
Setup with other module   
   
```
{
  socketIO // socket object
}
```
   
****
   
### **emitter(sets, _options_)**
Set action to event emitter   
   
- sets : object   
```
{
  [event name]: one {Action Object} or Array
}

{Action Object} can be :
- action type string
- action function (which return object with type even empty args)
```

- options : object   
```
{
  filter // function return boolean
  bindProps // funciton return object to merge with action object
  beforeEmit // function execute before emit
  skipSocketIO // skip SocketIO binding or not
}
```

**filter** : `(action) => { return boolean; }`   
\- action : action object  

**bindProps** : `(store) => { return {}; }`   
\- store : redux storage

**beforeEmit** : `(action, evt) => {}`   
if this function return `false`, driver will stop emit.   
\- action : action object   
\- evt : event name
  
**skipSocketIO** : `boolean default false`   
if driver has connection to SocketIO, skip the autobinding or not   
    
****
   
### **receiver(sets, _options_)**
Set event to action receiver   
   
- sets : object   
```
{
  [event name]: one (action function) or Array.
}
```

- options : object   
```
{
  filter // function return boolean
  beforeDispatch // function execute before dispatch
  skipSocketIO // skip SocketIO binding or not
}
```

**filter** : `(data) => { return boolean; }`   
\- data : data from receiver  

**beforeDispatch** : `(data, evt) => {}`   
if this function return `false`, driver will stop dispatch action.   
\- data : data from receiver   
\- evt : event name  
  
**skipSocketIO** : `boolean default false`   
if driver has connection to SocketIO, skip the autobinding or not   
    
****
      
### **router(eventName, sets, _options_)**
Set an event manage multiple actions emitter/receiver with action pair. It will bind `$reduxDriverStamp` key on emitter action object, if server-side response with that key system will dispatch its pair receiver action.   
   
- eventName: string

- sets : one {Action Pair} or Array   
```
{Action Pair} : 
{
  emitter: (emitter action)
  receiver: (receiver action)
}
```

- options : object   
```
{
  emitter // object of emitter's options
  receiver // object of emitter's options
  latestOnly // boolean of dispatch latest response only or not
}
```
   
***
   
### **trigger(eventName, data)**
Trigger receiver event manually.   
   
- eventName: string
- data : data pass to event  
