var app = {
  request: null,
  connection: null,
  ping: 1,

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
    app.createNewSession();
  },

  initializePresentation: function() {
    var presentationElement = document.querySelector('#deviceready .presentationReady');
    presentationElement.addEventListener('touchstart', function() {
      app.start();
    });

    var pingElement = document.querySelector('#deviceready .onstatechangeConnected');
    pingElement.addEventListener('touchstart', function() {
      if (app.connection) {
        app.connection.send({ping: app.ping});
      }
    });

    var closeElement = document.querySelector('#deviceready .close');
    closeElement.addEventListener('touchstart', function() {
      if (app.connection) app.connection.close('closed by sender');
    });

    var reconnectElement = document.querySelector('#deviceready .reconnect');
    reconnectElement.addEventListener('touchstart', function() {
      console.log(app.connection.state);
      if (app.connection && app.connection.state === 'closed') {
        app.request.reconnect(app.connection.id);
      }
    });

    var terminateElement = document.querySelector('#deviceready .terminate');
    terminateElement.addEventListener('touchstart', function() {
      if (app.connection) {
        app.connection.terminate();
      }
    });
  },

  start: function() {
    console.log(app.request);
    app.request.start().then(function(connection) {
      console.log('started: connection: ', connection, connection.state);
    });
  },

  createNewSession: function() {
    var receivedElement = document.querySelector('#deviceready .received');
    var presentationElement = document.querySelector('#deviceready .presentationReady');
    app.request = new PresentationRequest('receiver.html');
    app.request.getAvailability().then(function(availability) {
      availability.onchange = function(event) {
        console.log('availability', event, event.connection);
        app.setUpConnection(event.connection);
        if (event.value === true) {
          presentationElement.setAttribute('style', 'display:block;');
          receivedElement.setAttribute('style', 'display:none');
        } else {
          presentationElement.setAttribute('style', 'display:none;');
          receivedElement.setAttribute('style', 'display:block;');
        }
      }
    });
  },

  setUpConnection: function(connection) {
    app.connection = connection;

    var pingElement = document.querySelector('#deviceready .onstatechangeConnected');
    var closeElement = document.querySelector('#deviceready .close');
    var presentationElement = document.querySelector('#deviceready .presentationReady');
    var reconnectElement = document.querySelector('#deviceready .reconnect');
    var terminateElement = document.querySelector('#deviceready .terminate');

    app.connection.onconnect = function(connection) {
      console.log('connected:', connection);
      pingElement.setAttribute('style', 'display:block;');
      closeElement.setAttribute('style', 'display:block;');
      terminateElement.setAttribute('style', 'display:block;');
      presentationElement.setAttribute('style', 'display:none;');
      reconnectElement.setAttribute('style', 'display:none');
    };

    app.connection.onclose = function(event) {
      console.log('closed:', event.message);
      pingElement.setAttribute('style', 'display:none;');
      closeElement.setAttribute('style', 'display:none;');
      reconnectElement.setAttribute('style', 'display:block');
    };

    app.connection.onterminate = function(connection) {
      console.log('terminated:', connection);
      app.ping = 1;
      var pingCount = document.querySelector('#pingCount');
      pingCount.innerHTML = '' + app.ping;
      pingElement.setAttribute('style', 'display:none;');
      closeElement.setAttribute('style', 'display:none;');
      terminateElement.setAttribute('style', 'display:none;');
      reconnectElement.setAttribute('style', 'display:none');

      app.createNewSession();
    };


    app.connection.onmessage = function(msg) {
      var ping = msg.ping;
      if (ping) {
        app.ping = ping + 1;
        var pingCount = document.querySelector('#pingCount');
        pingCount.innerHTML = '' + app.ping;
      }
    };
  }
};

app.initialize();
