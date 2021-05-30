// [abc] ipcRenderer to communicate with main.js
const  { ipcRenderer } = require('electron');
// synchronous & asynchronous listener test
console.log(
ipcRenderer.sendSync('synchronous-message', 'ping'  ));
ipcRenderer.send(   'asynchronous-message', 'ping...');
ipcRenderer.on(     'asynchronous-reply', (event, arg) => { console.log(arg); } );
// renderer.js initialization
ipcRenderer.on('INIT',       (event, arg0, arg1) => { txtVersion.innerText = arg0; btnSerial.innerText = arg1; } );
// serial port data listener
ipcRenderer.on('RXD',        (event, arg) => { txtMessage.innerText = arg; } );
// asynchronous control reply
ipcRenderer.on('CTRL-reply', (event, arg0, arg1, arg2) => {
switch(arg0) {
case  0: btnSerial.innerText = arg1 ? 'serial' : 'error'; break;
case  1: btnSerial.innerText = arg1 ? arg2     : 'error'; break;
default: break; } } );

let txtVersion = document.getElementById('app-version');
let btnSerial  = document.getElementById('SERIAL');
let btnDemo    = document.getElementById('demo');
let txtMessage = document.getElementById('message');
btnDemo.onclick   = () => { ipcRenderer.send('TXD' ,'m'); }
btnSerial.onclick = () => { ipcRenderer.send('CTRL', btnSerial.innerText == 'serial' ? 1 : 0); }
