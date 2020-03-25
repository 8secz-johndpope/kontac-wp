'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthController = function AuthController(app) {
    _classCallCheck(this, AuthController);

    app.get('/login', function (req, res) {
        if (req.session.logged) {
            return res.redirect('/');
        }
        res.sendFile(_path2.default.resolve(__dirname, '..', 'views', 'login.html'));
    });
    app.post('/login', function (req, res) {
        if (req.body && req.body.email && req.body.password) {
            var _req$body = req.body,
                email = _req$body.email,
                password = _req$body.password;

            var user = global.conn.query('select * from users where email = "' + email + '" and password = "' + password + '"');
            if (user[0]) {
                req.session.logged = req.body;
                req.session.save();
                if (req.query.agent) {
                    res.redirect(req.query.agent);
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/login?error');
                res.end();
            }
        } else {
            res.redirect('/login');
        }
    });

    app.get('/logout', function (req, res) {
        console.log('oioi');
        req.session.logged = false;
        console.log(req.query);
        if (req.query.agt) {
            res.redirect('/agent');
        } else {
            res.redirect('/login');
        }
    });

    app.get('/', function (req, res) {
        if (req.session.logged) {
            res.redirect('/dashboard');
        } else {
            res.redirect('/login');
        }
    });
};

exports.default = AuthController;