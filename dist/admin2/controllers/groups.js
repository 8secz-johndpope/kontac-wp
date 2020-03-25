'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _groups = require('../models/groups');

var _groups2 = _interopRequireDefault(_groups);

var _users = require('../models/users');

var _users2 = _interopRequireDefault(_users);

var _dateformat = require('dateformat');

var _dateformat2 = _interopRequireDefault(_dateformat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Groups = function Groups(app) {
    _classCallCheck(this, Groups);

    app.get('/groups', function (req, res) {
        var alert = null;
        if (req.query.hasOwnProperty('success')) {
            alert = ['success', req.query.success];
        }
        res.render('groups.ejs', {
            user: res.user,
            dateformat: _dateformat2.default,
            alert: alert,
            groups: _groups2.default.get().map(function (a) {
                return Object.assign(a, { qtd: _groups2.default.getCountAgents(a.group_id) });
            })
        });
    });

    app.post('/groups/delete', function (req, res) {
        //res.status(401).end();
        _groups2.default.delete(req.body.group_id);
        res.status(200).end();
    });

    app.get('/groups/check_name', function (req, res) {
        var groups = global.conn.query('select group_name from groups where group_name="' + req.query.group_name.replace(/"/g, '').trim() + '"');
        if (groups.length === 0) return res.send('OK');
        res.send('FAIL');
    });

    app.all('/groups/edit/:id', function (req, res) {
        var alert;
        req.params.id = req.params.id.replace(/[^0-9]/g, '');
        if (req.params.id == '' || !req.params.id) {
            res.redirect('/groups');
        }

        if (req.body.group_name) {
            if (typeof req.body['status[]'] === 'string') req.body['status[]'] = [req.body['status[]']];
            if (typeof req.body['users[]'] === 'string') req.body['users[]'] = [req.body['users[]']];

            /*res.end();
            return;*/
            _groups2.default.update(req.params.id, {
                group_name: req.body.group_name,
                statuses: req.body['status[]'].join()
            });
            _groups2.default.deleteAllSelected(req.params.id);
            if (req.body['users[]'].length === 1) req.body['users[]'] = [req.body['users[]']];
            req.body['users[]'].forEach(function (user) {
                return _groups2.default.insertUsersGroups(user, req.params.id);
            });
            return res.redirect('/groups?success=Fila editada com sucesso');
        }

        var group = _groups2.default.get('group_id = ' + req.params.id + ' ');
        if (!group[0]) {
            res.redirect('/groups');
        }

        res.render('groups_form.ejs', {
            user: res.user,
            type: 'edit',
            group_name: group[0].group_name,
            users: _users2.default.get(),
            users_selected: _groups2.default.getUsersSelected(group[0].group_id).map(function (a) {
                return a.user_id;
            }),
            alert: alert ? alert : false,
            statuses: group[0].statuses.split(',')
        });
    });

    app.all('/groups/add', function (req, res) {
        var alert;
        if (req.body.group_name) {
            var group_data = {
                group_name: req.body.group_name,
                statuses: _typeof(req.body['status[]']) === 'object' ? req.body['status[]'].join() : req.body['status[]']
            };

            var _groupsModel$insert = _groups2.default.insert(group_data),
                insertId = _groupsModel$insert.insertId;

            console.log(req.body);
            if (req.body['users[]'] === undefined) {
                req.body['users[]'] = [];
            } else {
                if (_typeof(req.body['users[]']) !== 'object') req.body['users[]'] = [req.body['users[]']];
                req.body['users[]'].forEach(function (user) {
                    return _groups2.default.insertUsersGroups(user, insertId);
                });
            }
            return res.redirect('/groups?success=Fila criada com sucesso');
        }
        res.render('groups_form.ejs', {
            user: res.user,
            type: 'add',
            group_name: req.body.group_name,
            users: _users2.default.get(),
            users_selected: [],
            alert: alert ? alert : false,
            statuses: ['']
        });
    });
};

exports.default = Groups;