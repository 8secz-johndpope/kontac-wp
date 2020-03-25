'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _entrys = require('../models/entrys');

var _entrys2 = _interopRequireDefault(_entrys);

var _dateformat = require('dateformat');

var _dateformat2 = _interopRequireDefault(_dateformat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Entrys = function Entrys(app) {
    _classCallCheck(this, Entrys);

    app.get('/entrys', function (req, res) {
        var alert = null;
        if (req.session.alert) alert = req.session.alert;
        res.render('entrys.ejs', {
            user: res.user,
            entrys: _entrys2.default.get(),
            dateformat: _dateformat2.default,
            alert: alert
        });
    });

    app.get('/entrys/delete/:id', function (req, res) {
        global.conn.query('delete from entrys where entry_id = ' + req.params.id);
        req.session.alert = ['success', 'Canal de entrada excluído com sucesso'];
        return res.redirect('/entrys');
    });

    app.all('/entrys/add', function (req, res) {
        var alert = null;
        if (req.body.title) {
            var entry_data = {
                title: req.body.title,
                connector: req.body.connector,
                json_data: JSON.stringify({ token: req.body.whatsapp_token }),
                connector_external_id: req.body.connector_external_id,
                go_group: req.body.go_group,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: res.user.user_id,
                updated_by: res.user.user_id
            };
            _entrys2.default.insert(entry_data);
            req.session.alert = ['success', 'Salvo com sucesso'];
            return res.redirect('/entrys');
            res.end();
            ///return;
        }
        res.render('entrys_form.ejs', {
            type: 'new',
            alert: null,
            user: res.user,
            title: '',
            connector: 'whatsapp',
            go_group: null,
            connector_external_id: '',
            json_data: {
                token: ''
            },
            groups: global.conn.query('select * from groups')
        });
    });

    app.all('/entrys/edit/:id', function (req, res) {
        if (req.body.title) {
            var entry_data = {
                title: req.body.title,
                connector: req.body.connector,
                connector_external_id: req.body.connector_external_id,
                go_group: req.body.go_group,
                json_data: JSON.stringify({
                    token: req.body.whatsapp_token
                }),
                updated_at: new Date().getTime(),
                updated_by: res.user.user_id
            };

            _entrys2.default.update(req.params.id, entry_data);
        }
        var entry = global.conn.query('select * from entrys where entry_id = ' + req.params.id);
        if (!entry[0]) res.send('ERRO - ENTRADA N EXISTE');
        entry = entry[0];
        res.render('entrys_form.ejs', {
            type: 'edit',
            alert: null,
            user: res.user,
            title: entry.title,
            connector: 'whatsapp',
            go_group: entry.go_group,
            connector_external_id: entry.connector_external_id,
            json_data: JSON.parse(entry.json_data),
            groups: global.conn.query('select * from groups')
        });
    });
};

exports.default = Entrys;