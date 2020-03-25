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
    "host": "mail.telek.com.br",
    "port": 465,
    "secure": true,
    "auth": {
        "user": "naoresponder@telek.com.br",
        "pass": "kelet2011"
    }
};

var UserModel = function () {
    function UserModel() {
        _classCallCheck(this, UserModel);
    }

    _createClass(UserModel, [{
        key: 'get',
        value: function get(_w) {
            var query = 'select * from users';
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
            var query = 'insert into users (' + Object.keys(data).join() + ') values ("' + Object.values(data).join('","') + '")';
            return global.conn.query(query);
        }
    }, {
        key: 'update',
        value: function update(user_id, data) {
            return global.conn.query('update users set ' + Object.keys(data).map(function (a) {
                return a + '="' + data[a] + '"';
            }) + ' where user_id=' + user_id);
        }
    }, {
        key: 'delete',
        value: function _delete(user_id) {
            return global.conn.query('delete from users where user_id = ' + user_id);
        }
    }, {
        key: 'generatePasswordWithEmail',
        value: function generatePasswordWithEmail(email) {
            var transporter = _nodemailer2.default.createTransport(mailConfig);
            var password = _generatePassword2.default.generate();
            var mail = transporter.sendMail({
                from: mailConfig.auth.user,
                to: email,
                subject: 'Seja bem vindo! Sua senha foi definida!',
                text: 'Você foi cadastrado no sistema do Kontac!\nSua senha é: ' + password + "\n\
            Guarde essa senha ou redefina-o nas configurações de seu usuário"
            });
            return password;
        }
    }]);

    return UserModel;
}();

exports.default = new UserModel();