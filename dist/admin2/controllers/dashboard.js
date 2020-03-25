'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function _class(app, io, tickets) {
    _classCallCheck(this, _class);

    app.get('/dashboard', function (req, res) {
        res.render('bar.ejs', {
            user: res.user,
            groups: global.conn.query('select group_name, group_id from groups;'),
            pauses: global.conn.query('select * from pauses')
        });
        res.end();
    });
    app.get('/dashboard_data', function (req, res) {

        if (!req.query.group) req.query.group = 'ALL';
        var where_group = '';
        if (req.query.group !== 'ALL') {
            where_group = ' and group_id = ' + req.query.group + ' ';
        }

        var return_data = {};
        return_data.tabs_top = {
            queue_total: global.conn.query('select count(*) c from tickets where status="WAITING AGENT" ' + where_group)[0].c,
            queue_time_avarage: global.conn.query('select sec_to_time(max(unix_timestamp(now())-unix_timestamp(requeue))) a from tickets where status="WAITING AGENT" ' + where_group + ';')[0].a || 'n/a',
            queue_total_today: global.conn.query('select count(*) c from tickets where started_at > DATE_FORMAT(now(), "%Y-%m-%d 00:00:00") ' + where_group)[0].c
        };
        return_data.status_today = global.conn.query('select count(*) c, status from tickets where started_at > DATE_FORMAT(now(), "%Y-%m-%d 00:00:00") ' + where_group + ' group by status order by c');
        return_data.live_agents = Object.values(io.sockets.clients().sockets).slice().filter(function (a) {
            return a.connected && (req.query.group === 'ALL' || a.handshake.query.groups.map(function (a) {
                return a + "";
            }).includes('' + req.query.group));
        }).map(function (a) {
            return {
                user_id: a.handshake.query.user_id,
                name: global.conn.query('select name from users where user_id = ' + a.handshake.query.user_id)[0].name,
                status: a.handshake.query.status,
                statusUpdated: a.handshake.query.statusUpdated,
                inChat: Object.values(tickets).filter(function (b) {
                    return b === a.id;
                }).length
            };
        });

        var queryClientsWithoutWhere = 'select\
                t.ticket_id, t.user_id, c.client_name, c.client_external_id, c.picture, g.group_name, sec_to_time(unix_timestamp(now()) - unix_timestamp(t.requeue)) requeue\
            from\
                tickets t\
            inner join\
                clients c on c.client_id=t.client_id\
            inner join groups g on g.group_id=t.group_id';

        return_data.list_queue = global.conn.query(queryClientsWithoutWhere + ' where status=\'WAITING AGENT\' ' + where_group + '\
            order by g.group_name;');

        return_data.list_queue_chat = global.conn.query(queryClientsWithoutWhere + ' where status=\'IN CHAT\' ' + where_group + '\
            order by g.group_name;').map(function (a) {
            a.user_name = global.conn.query('select name from users where user_id = ' + a.user_id);
            if (a.user_name[0]) {
                a.user_name = a.user_name[0].name;
            } else {
                a.user_name = 'N/A';
            }
            return a;
        });

        return_data.tabs_top.agents_online = return_data.live_agents.filter(function (a) {
            return a.status[0] === 'ONLINE';
        }).length;

        res.send(return_data);
    });
};

exports.default = _class;