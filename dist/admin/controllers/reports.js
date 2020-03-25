'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _users = require('../models/users');

var _users2 = _interopRequireDefault(_users);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Reports = function Reports(app) {
    _classCallCheck(this, Reports);

    app.get('/relatorio/desempenho-de-usuarios', function (req, res) {
        console.log(req.query);
        if (req.query.get === 'true') {
            var data = JSON.parse(req.query.data);
            console.log(data);
            if (data.agroup_time === 'dia') {
                var data_dia = global.conn.query('select user_id, substring(started_at,1,10) as date, count(*) as count from tickets where user_id in (' + data.users.join(',') + ') and started_at between "' + data.dates[0] + ' 00:00:00" and "' + data.dates[1] + ' 23:59:59" group by user_id, substring(started_at,1,10);');
                res.send(data_dia);
            }
            return res.end();
        }
        res.render('relatorio/desempenhodeusuario.ejs', {
            user: res.user,
            users: _users2.default.get()
        });
    });
};

exports.default = Reports;