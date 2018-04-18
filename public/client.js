/* callback chain (i ain't no callaBack girl)
    connect(sends 'conect' to server)
      ->init(gets server state) + initUi(updates ui with server state)
        ->listenToElems(event listener for inputs)
          ->getElemStatus(parses input / input events)
            ->sendState(send new state to server and updates ui)
*/

(function() { //iffy

  //global vars
  var socket = io.connect('192.168.0.66:8080'); //socket port and ip
  let ledStatus = {
    red: null,
    blue: null,
    green: null,
    on: null
  }; //state

  function getUiElements() { //retrive ui elem
    var uiElements = {
      redSlider: $("#red"),
      greenSlider: $("#green"),
      blueSlider: $("#blue"),
      backSlider: $("#led"),
      ledSwitch: $("#ledSwitch")
    }
    return uiElements;
  }

  function changeBg(ledState, elem) { //changeBg of elem to led color
    if ((ledState.red && ledState.green && ledState.blue) != 0) {
      var color = "rgb(" + ledState.red + ',' + ledState.green +
        ',' + ledState.blue + ')';
      elem.css('background-color', color);
    }
  }

  function initUi() { //inits ui elems
    var uiElements = getUiElements();
    uiElements.redSlider.val(ledStatus.red);
    uiElements.greenSlider.val(ledStatus.green);
    uiElements.blueSlider.val(ledStatus.blue);
    changeBg(ledStatus, uiElements.backSlider);
    if (ledStatus.on == true) {
      uiElements.ledSwitch.prop('checked', true);
    } else {
      uiElements.ledSwitch.prop('checked', false);
    }
  }

  function updateState(ledState) { //updates the state and returns it
    var uiElements = getUiElements();
    ledStatus.red = ledState.red;
    ledStatus.green = ledState.green;
    ledStatus.blue = ledState.blue;
    ledStatus.on = ledState.on;
    changeBg(ledState, uiElements.backSlider);
    return ledStatus;
  }

  function init() { //initialises ui with response data fetched from server
    socket.on('join', (data) => { //gets state from server
      console.log(data);
      initUi(updateState(data)); // inti ui
      console.log(ledStatus);
    })
    listenToElems(); //hollaBack girl <3
  }

  function connect() { //connects to server and calls init to fetch data
    socket.on('connect', (data) => {
      socket.emit('join', 'send me that big data my socket is ready :*');
    })
    init(); //hollaBack girl <3
  }

  function listenToElems() { //listen to change events on elems
    var uiElements = getUiElements();
    uiElements.redSlider.on('input', getElemStatus.bind(null, 'red'));
    uiElements.greenSlider.on('input', getElemStatus.bind(null, 'green'));
    uiElements.blueSlider.on('input', getElemStatus.bind(null, 'blue'));
    uiElements.ledSwitch.on('click', () => {
      if (uiElements.ledSwitch.is(":checked")) {
        getElemStatus('check', true);
      } else {
        getElemStatus('check', false);
      }
    })
  } // also it hollaBack to getElemStatus

  function sendState(newState) { //sends the new state to server & updates ui
    socket.emit('rgb', newState);
  }

  function getElemStatus(handle, ev) { //parses data from inputs & updates state
    var newState = ledStatus;
    switch (handle) {
      case 'red':
        newState.red = ev.target.value;
        break;
      case 'green':
        newState.green = ev.target.value;
        break;
      case 'blue':
        newState.blue = ev.target.value;
        break;
      case 'check':
        console.log(ev);
        newState.on = ev;
        break;
    }
    sendState(updateState(newState)); // sends new state to server
  }

  //main//
  connect();

}());
