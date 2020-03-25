'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _generatePassword = require('generate-password');

var _generatePassword2 = _interopRequireDefault(_generatePassword);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mailConfig = {
    "service": "gmail",
    "auth": {
        "user": "userplaceholderpatrick@gmail.com",
        "pass": "placeholder"
    }
};

var EntryModel = function () {
    function EntryModel() {
        _classCallCheck(this, EntryModel);
    }

    _createClass(EntryModel, [{
        key: 'get',
        value: function get(_w) {
            var query = 'select * from entrys';
            if (_w) {
                query += " where " + _w;
            }
            return global.conn.query(query);
        }
    }, {
        key: 'checkEmailExists',
        value: function checkEmailExists(email) {
            var query = 'select email from users where email = "' + email + '"';
            return global.conn.query(query).length == 0 ? false : true;
        }
    }, {
        key: 'insert',
        value: function insert(data) {
            var query = 'insert into entrys (' + Object.keys(data).join() + ') values ("' + Object.values(data).map(function (a) {
                return (a + "").replace(/"/g, '\\"');
            }).join('","') + '")';
            return global.conn.query(query);
        }
    }, {
        key: 'update',
        value: function update(entry_id, data) {
            return global.conn.query('update entrys set ' + Object.keys(data).map(function (a) {
                return a + '="' + ("" + data[a]).replace(/"/g, '\\"') + '"';
            }) + ' where entry_id=' + entry_id);
        }
    }]);

    return EntryModel;
}();

exports.default = new EntryModel();