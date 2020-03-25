'use strict';

var _users = require('./controllers/users');

var _users2 = _interopRequireDefault(_users);

var _groups = require('./controllers/groups');

var _groups2 = _interopRequireDefault(_groups);

var _entrys = require('./controllers/entrys');

var _entrys2 = _interopRequireDefault(_entrys);

var _agent = require('./controllers/agent');

var _agent2 = _interopRequireDefault(_agent);

var _agentsocket = require('./controllers/agentsocket');

var _agentsocket2 = _interopRequireDefault(_agentsocket);

require('./functions/mysqlConnect');

var _expressconfigure = require('./functions/expressconfigure');

var _expressconfigure2 = _interopRequireDefault(_expressconfigure);

var _auth = require('./controllers/auth');

var _auth2 = _interopRequireDefault(_auth);

var _dashboard = require('./controllers/dashboard');

var _dashboard2 = _interopRequireDefault(_dashboard);

var _reports = require('./controllers/reports');

var _reports2 = _interopRequireDefault(_reports);

var _pauses = require('./controllers/pauses');

var _pauses2 = _interopRequireDefault(_pauses);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!process.env.HOSTNAME) {
    process.env.HOSTNAME = 'patrick';
}

var app = new _expressconfigure2.default();
var https = require('http').createServer({
    //key: fs.readFileSync('/etc/letsencrypt/live/whatsapp.telek.com.br/privkey.pem'),
    //cert: fs.readFileSync('/etc/letsencrypt/live/whatsapp.telek.com.br/cert.pem')
}, app);
var io = require('socket.io')(https);

/*=========== AGENT SOCKET ==========*/

var _ref = new _agentsocket2.default(io, app),
    tickets = _ref.tickets;

/*============ API AGENT ===========*/


new _agent2.default(app);

/*============== AUTH ==============*/
new _auth2.default(app);

/* ========== DASHBOARD =========== */
new _dashboard2.default(app, io, tickets);

/*=========== USUÁRIOS ==========*/
new _users2.default(app);

/*=========== ENTRYS ==========*/
new _entrys2.default(app);

/*=========== GRUPO ==========*/
new _groups2.default(app);

/*=========== RELATORIOS ==========*/
new _reports2.default(app);

/*=========== PAUSES ==========*/
new _pauses2.default(app);

https.listen(443, function () {
    console.log('Servidor rodando em https://127.0.0.1');
});

var crtPath = '/etc/letsencrypt/live/whatsapp.telek.com.br';
if (process.env.HOSTNAME === 'patrick') {
    crtPath = '/etc/letsencrypt/live/whatsapp.telek.local';
}

require('http').createServer(function (req, res) {
    res.writeHead(301, { 'Location': 'https://' + req.headers.host + req.url });
    return res.end();
}).listen(80);