/**
 * Module dependencies
 */

var assert = require('assert');
var util = require('util');

var _ = require('lodash');
var sails = require('sails');
var socketioClient = require('socket.io-client');
var sailsioClient = require('sails.io.js');

describe('lifecycle events', function (){

  // Used to check state below in tests
  var numTimesOnConnectTriggered = 0;
  var numTimesOnDisconnectTriggered = 0;
  var onConnectArgs;
  var onDisconnectArgs;

  var app;

  // Since we have to set up a separate app instance to test this,
  // we just do that inline here
  before(function (done){

    // New up an instance of Sails and lift it.
    app = sails.Sails();

    app.lift({
      port: 1684,
      log: { level: 'error' },
      globals: false,
      hooks: {
        // Inject the sockets hook in this repo into this Sails app
        sockets: require('../')
      },
      loadHooks: ['moduleloader', 'userconfig', 'http', 'session', 'sockets'],
      sockets: {
        onConnect: function (session, socket) {
          numTimesOnConnectTriggered++;
          onConnectArgs = Array.prototype.slice.call(arguments);
        },
        onDisconnect: function (session, socket) {
          numTimesOnDisconnectTriggered++;
          onDisconnectArgs = Array.prototype.slice.call(arguments);
        }
      }
    },function (err) {
      if (err) return done(err);

      return done(err);
    });
  });

  after(function (done){
    app.lower(function () {
      return done();
    });
  });


  var newSocket;

  describe('when a new socket is connected', function (){

    it('should trigger onConnect lifecycle event', function (done){
      newSocket = io.sails.connect('http://localhost:'+1684);
      newSocket.on('connect', function (){
        if (numTimesOnConnectTriggered !== 1) {
          return done(new Error('`numTimesOnConnectTriggered` should be exactly 1, but is actually '+numTimesOnConnectTriggered));
        }
        return done();
      });
    });

    it('should provide access to socket');

    it('should provide access to session');

  });

  describe('when a socket is disconnected', function (){
    it('should trigger onDisconnect lifecycle event', function (done){
      newSocket.on('disconnect', function (){
        // Wait for a little while to make sure the server had time to actually
        // run the onDisconnect lifecycle event.
        setTimeout(function (){
          if (numTimesOnDisconnectTriggered !== 1) {
            return done(new Error('`numTimesOnDisconnectTriggered` should be exactly 1, but is actually '+numTimesOnDisconnectTriggered));
          }
          return done();
        }, 1000);
      });
      newSocket.disconnect();
    });

    it('should provide access to socket');

    it('should provide access to session');
  });

});