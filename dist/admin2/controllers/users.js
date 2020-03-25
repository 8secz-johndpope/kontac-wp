'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _users = require('../models/users');

var _users2 = _interopRequireDefault(_users);

var _dateformat = require('dateformat');

var _dateformat2 = _interopRequireDefault(_dateformat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Users = function Users(app) {
    _classCallCheck(this, Users);

    app.get('/users', function (req, res) {
        var alert = null;
        if (req.query.hasOwnProperty('success')) {
            alert = ['success', req.query.success];
        }
        res.render('users.ejs', {
            user: res.user,
            users: _users2.default.get(),
            dateformat: _dateformat2.default,
            alert: alert
        });
    });

    app.post('/users/delete', function (req, res) {
        if (req.body.user_id == res.user.user_id) {
            return res.status(401).end();
        }
        res.status(200).end();
        _users2.default.delete(req.body.user_id);
    });

    app.all('/users/edit/:id', function (req, res) {
        var alert;
        if (req.params.id === 'me') req.params.id = res.user.user_id + "";
        req.params.id = req.params.id.replace(/[^0-9]/g, '');
        if (req.params.id == '' || !req.params.id) {
            res.redirect('/users');
        }
        var user = _users2.default.get('user_id = ' + req.params.id + ' ');
        if (!user[0]) {
            res.redirect('/users');
        }
        if (req.body.name) {
            var user_data = {
                name: req.body.name,
                apelido: req.body.apelido,
                email: req.body.email,
                permission: req.body.permission,
                password: req.body.password
            };
            if (user[0].email !== user_data.email && _users2.default.checkEmailExists(user_data.email)) {
                alert = ['danger', 'Esse email já esta cadastrado'];
            } else {
                if (req.body.password && req.body.password != '') {
                    user_data.password = req.body.password;
                }
                _users2.default.update(req.params.id, user_data);
                res.redirect('/users?success=Usuário editado com sucesso');
                return res.end();
            }
            user_data.user_id = user[0].user_id;
            user[0] = user_data;
        }
        res.render('user_form.ejs', {
            user: res.user,
            type: 'edit',
            name: user[0].name,
            apelido: user[0].apelido,
            email: user[0].email,
            password: user[0].password,
            permission: user[0].permission,
            user_id: user[0].user_id,
            alert: alert ? alert : false
        });
    });

    app.all('/users/add', function (req, res) {
        var alert;
        if (req.body.name) {
            var user_data = {
                name: req.body.name,
                apelido: req.body.apelido,
                email: req.body.email,
                permission: req.body.permission,
                password: req.body.password
            };
            if (_users2.default.checkEmailExists(user_data.email)) {
                alert = ['danger', 'Esse email já esta cadastrado'];
            } else {
                try {
                    //user_data.password = userModel.generatePasswordWithEmail(user_data.email)
                    _users2.default.insert(user_data);
                    res.redirect('/users?success=Usuário criado com sucesso');
                } catch (err) {
                    console.error('ERRO NO EMAIL');
                    res.redirect('/users?success=Serviço temporariamente indisponível');
                }
                return res.end();
            }
        }
        res.render('user_form.ejs', {
            user: res.user,
            type: 'add',
            name: req.body.name,
            apelido: req.body.apelido,
            email: req.body.email,
            permission: req.body.permission,
            password: '',
            user_id: '',
            alert: alert ? alert : false
        });
    });

    app.post('/users/request_password', function (req, res) {
        if (req.body.user_id) {
            var user = _users2.default.get('user_id=' + req.body.user_id);
            if (user[0]) {
                //let password = userModel.generatePasswordWithEmail(user.email)
                _users2.default.update(req.body.user_id, {
                    password: password
                });
                res.status(200).send('');
            }
        } else {
            res.status(401).send('');
        }
    });
};

exports.default = Users;