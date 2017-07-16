var app = {
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  onDeviceReady: function() {
    app.receivedEvent('deviceready');
  },
  receivedEvent: function(id) {
    var listeningElement = document.querySelector('#' + id + ' .listening');
    var receivedElement = document.querySelector('#' + id + ' .received');
    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');
    app.initializePresentation();
  },
  connection: null,
  initializePresentation: function() {
    navigator.presentation.receiver.connectionList.then(function(list) {
      console.log('app: received connection', list);
      if (list.connections.length > 0) {
        app.connection = list.connections[0];
        app.attachToSession();
      }
    });
  },
  timeoutHandle: null,
  attachToSession: function() {
    var pingElement = document.querySelector('#deviceready .onpresent');
    app.connection.onconnect = function(result) {
      console.log('app: received connected event', result);
      pingElement.setAttribute('style', 'display:block;');
    };
    app.connection.onclose = function(result) {
      console.log('app: received close event', result);
      pingElement.setAttribute('style', 'display:none;');
    };
    app.connection.onterminate = function(result) {
      console.log('app: received terminate event', result);
      pingElement.setAttribute('style', 'display:none;');
    };

    app.connection.onmessage = function(msg) {
      console.log('app: received message event', msg);
      var pc = msg.ping;
      if (pc) {
        var pingCount = document.querySelector('#pingCount');
        pingCount.innerHTML = '' + pc;
        app.connection.send(msg);

        var autocloseElement = document.querySelector('#deviceready .autoclose');
        if (app.timeoutHandle) {
          clearTimeout(app.timeoutHandle);
          autocloseElement.setAttribute('style', 'display:none;');
        }
        app.timeoutHandle = setTimeout(function() {

          autocloseElement.setAttribute('style', 'display:block;');
          app.timeoutHandle = setTimeout(function() {
            autocloseElement.setAttribute('style', 'display:none;');
            app.connection.close('closed', 'closed by receiver');
          }, 5000);
        }, 5000);
      }
    };
  }
};

app.initialize();
