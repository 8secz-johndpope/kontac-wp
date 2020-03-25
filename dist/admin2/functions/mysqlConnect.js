'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mySQL = require('../config/mySQL');

var _mySQL2 = _interopRequireDefault(_mySQL);

var _syncMysql = require('sync-mysql');

var _syncMysql2 = _interopRequireDefault(_syncMysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!process.env.HOSTNAME) {
    process.env.HOSTNAME = 'patrick';
}

global.conn = new _syncMysql2.default({
    user: _mySQL2.default.username,
    password: _mySQL2.default.password,
    database: _mySQL2.default.database,
    host: _mySQL2.default.host,
    charset: 'utf8mb4'
});

//global.conn.connect();

exports.default = false;