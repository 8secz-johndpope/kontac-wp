'use strict';

var MySQLEvents = require('@rodrigogs/mysql-events');

var program = async function program() {
  var instance = new MySQLEvents({
    host: 'localhost',
    user: 'root',
    password: 'kelet2011'
  }, {
    startAtEnd: true
  });

  await instance.start();

  instance.addTrigger({
    name: 'Whole database instance',
    expression: 'kontac',
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: function onEvent(event) {
      console.log(event);
    }
  });

  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program().then(function () {
  return console.log('Waiting for database vents...');
}).catch(console.error);