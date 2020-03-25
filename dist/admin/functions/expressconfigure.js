'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressEjsLayouts = require('express-ejs-layouts');

var _expressEjsLayouts2 = _interopRequireDefault(_expressEjsLayouts);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _mySQL = require('../config/mySQL');

var _mySQL2 = _interopRequireDefault(_mySQL);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MySQLStore = require('connect-mysql')(_expressSession2.default);

var expressConfigure = function expressConfigure() {
    _classCallCheck(this, expressConfigure);

    var app = (0, _express2.default)();

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/../views');
    app.use(_expressEjsLayouts2.default);
    app.use((0, _cookieParser2.default)());
    app.use(_bodyParser2.default.json());
    app.use(_bodyParser2.default.urlencoded({ extended: false }));

    app.use('/assets', _express2.default.static(__dirname + '/../assets'));
    app.set('trust proxy', 1);
    app.use((0, _expressSession2.default)({
        resave: true,
        saveUninitialized: true,
        secret: 'sdlfjljrowuroweu',
        cookie: {
            httpOnly: false,
            secure: true,
            maxAge: 15 * 60 * 1000
        },
        store: new MySQLStore({
            config: {
                user: _mySQL2.default.username,
                password: _mySQL2.default.password,
                database: _mySQL2.default.database
            }
        })
    }));

    app.use('/agent', function (req, res, next) {
        if (req.session.logged) {
            next();
        } else {
            res.redirect('/login?agent=http://' + req.headers.host + '/agent');
        }
    });

    app.use(function (req, res, next) {
        req.session.cookie._expires = new Date(0);
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', '*');
        //req.session.logged = true;
        if (process.env.HOSTNAME === 'patrick') {
            req.session.logged = { email: "pkhadson@gmail.com" };
        }
        if (!req.session.logged) {

            if (req.url.indexOf('api') === -1 && req.url.indexOf('login') === -1) {
                res.redirect('/login');
                return res.end();
            }
        } else {
            res.user = global.conn.query('select * from users where email="' + req.session.logged.email + '"')[0];
            res.user.theme = req.session.theme ? req.session.theme : '1';
        }
        return next();
    });
    app.use('/agent', _express2.default.static(__dirname + '/../agent'));

    app.post('/set_theme', function (req, res) {
        req.session.theme = req.body.theme;
        res.end();
    });

    return app;
};

exports.default = expressConfigure;