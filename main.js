const serialPort = require('serialport');
const readLine   = require('@serialport/parser-readline');
const path       = require('path');
                   require('update-electron-app')();

// [abc] ipcMain to communicate with renderer.js
const  { ipcMain, app, BrowserWindow } = require('electron');
// synchronous & asynchronous listener test
ipcMain.on( 'synchronous-message', (event, arg) => { console.log(arg); event.returnValue =                  'pong' ; } );
ipcMain.on('asynchronous-message', (event, arg) => { console.log(arg); event.reply('asynchronous-reply', '...pong'); } );
// serial port control listener
ipcMain.on('CTRL', (event, arg) => {
switch(arg) {
case  0: serialDisconnect(); break;
case  1: serialConnect(   ); break;
default: break; } } );
// serial port character command listener
ipcMain.on('TXD', (event, arg) => {
if (serialLink != null) { serialLink.write(arg, (err) => {
if (err) { win.webContents.send('CTRL-reply', false); console.log('Error: ', err.message); }
else       win.webContents.send('CTRL-reply',  true); } ); } } );
// serial port data sender
function serialReceived(chunk) { win.webContents.send('RXD', chunk); }
function serialOpened(       ) {
// serial port data listener
serialParser= serialLink.pipe(new readLine( { delimiter: '\n' } ) );
serialParser.on('data', serialReceived);
}

// [abc] serial port
let serialLink=  null ;
let serialName= 'NULL';
let serialParser;
// find the first Futaba port
function serialConnect(       ) {
serialPort.list().then(ports => {
ports.forEach(function(port   ) {
if (serialLink == null   &&      port.pnpId == 'USB\\VID_1008&PID_F166\\U2S_V0.1') { serialName = port.path;
    serialLink =  new serialPort(port.path,   { baudRate: 2457600 },  (err) =>     {
if (err) { win.webContents.send('CTRL-reply', 1, false); console.log('Error: ', err.message); } else { serialOpened();
           win.webContents.send('CTRL-reply', 1,  true,  serialName); } } ); } } ); console.log(serialLink == null ? 'none' : serialName); } );
}
function serialDisconnect(  ) {
if (serialLink != null)
    serialLink.close((err) => {
if (err) { win.webContents.send('CTRL-reply', 0, false); console.log('Error: ', err.message); }
else     { win.webContents.send('CTRL-reply', 0,  true); serialLink  = null; serialName = 'NULL'; } } );
}

let win = null;
function createWindow() {
// __dirname points to the path of the currently executing script
win = new BrowserWindow( { width: 800, height: 600,
webPreferences: { preload: path.join(__dirname, 'preload.js'),
// enable Node.js integration in renderer.js
nodeIntegration: true, contextIsolation: false } } );
win.loadFile('index.html');

// [abc] renderer.js initialization
win.webContents.on('did-finish-load', () => {
win.webContents.send('INIT', app.getVersion(), serialName); } );
}

// load web page when app is ready
app.whenReady().then(() => { createWindow();
// open a window if none are open (macOS)
app.on('activate', function () {
if (BrowserWindow.getAllWindows().length === 0) createWindow(); } ); } );
// quit application
app.on('window-all-closed', function () { if (process.platform !== 'darwin') app.quit(); } );

// [abc] start
serialConnect();
