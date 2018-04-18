'use strict'; //helps with debug
//includes//
const five = require('johnny-five');
const express = require('express');
const app = express();
const server = require('http').createServer(app).listen(8080);
const io = require('socket.io')(server);

app.use(express.static('public')) // static serve;

//global vars
let led = null; //global led obj
let state = {red: 0, green: 0, blue: 0, on: false}; //placeHolder stat for dbSta

function updateState(ledState) { //updates the state and returns it
  state.red = ledState.red;
  state.green = ledState.green;
  state.blue = ledState.blue;
  state.on = ledState.on;
  return state;
}

function setStateColor(newState, client) { //upd state & cntrls the led(on/off)
  var state = updateState(newState);
  client.broadcast.emit('join', newState); //also broadcasts state to other user
  if (state.on == true) {
    led.color({ red: state.red, blue: state.blue, green: state.green });
  } else {
    led.off();
  }
}

function initBoard(){ //sets led pins
  led = new five.Led.RGB( [13, 11, 9] );
  console.log('Arduino is ready.');
}

function disconnected() { //logs client nr on disc
  console.log("a client quit, clients: ", io.engine.clientsCount);
}

//main//
five.Board().on('ready', () => {
  initBoard(); //set led pins to arduino
  io.on('connection', (client) => { //listens connections
    console.log("a client connected, clients: ", io.engine.clientsCount);
    client.on('join', () => { client.emit('join', state); });//send curent state
    client.on('rgb', (newState) => { setStateColor(newState, client)} ); //rt up
    client.on('disconnect', () => { disconnected() }); //logs client nr on disc
  });
});
