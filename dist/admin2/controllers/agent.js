'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Entrys = function Entrys(app) {
    _classCallCheck(this, Entrys);

    var API = '/api';

    app.get('/teste2', function (req, res) {
        req.session.oi = 'oi';
        req.session.save();
        res.send(req.session.oi);
    });

    app.get('/teste', function (req, res) {
        // req.session.oi = 'oi';
        res.send(req.session.oi);
    });

    app.get(API + '/login', function (req, res) {
        res.end('ddd');
    });

    app.get(API + '/pauses', (0, _cors2.default)(), function (req, res) {
        res.send(global.conn.query('select * from pauses'));
    });

    app.get(API + '/logged', (0, _cors2.default)(), function (req, res) {
        if (!res.user) {
            res.send({ logged: false });
            res.status(404);
        } else {
            res.send({
                logged: true,
                name: res.user.name,
                email: res.user.email,
                permission: res.user.permission,
                user_id: res.user.user_id,
                groups: global.conn.query('select group_id from users_groups where user_id = ' + res.user.user_id).map(function (a) {
                    return a.group_id;
                })
            }).end();
        }
    });
};

exports.default = Entrys;