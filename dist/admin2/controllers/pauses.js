'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pauses = function Pauses(app) {
    _classCallCheck(this, Pauses);

    app.get('/pauses', function (req, res) {
        res.render('pauses.ejs', {
            user: res.user,
            pauses: global.conn.query('select * from pauses;')
        });
        res.end();
    });

    app.get('/pauses/:id', function (req, res) {
        res.send(global.conn.query('select * from pauses where pause_id = ' + req.params.id)[0]);
    });

    app.post('/pauses/edit/:id', function (req, res) {
        var data = {
            pause_name: req.body.pause_name,
            pause_limit: req.body.max_hour + ':' + req.body.max_minute + ':' + req.body.max_second
        };
        global.conn.query('update pauses set ' + Object.keys(data).map(function (a) {
            return a + '="' + data[a] + '"';
        }).join() + ' where pause_id = ' + req.params.id);
        res.send('ok');
    });

    app.post('/pauses/new', function (req, res) {
        var data = {
            pause_name: req.body.pause_name,
            pause_limit: req.body.max_hour + ':' + req.body.max_minute + ':' + req.body.max_second
        };

        var query_insert = 'insert into\
                pauses (' + Object.keys(data).join(',') + ')\
                values\
                ("' + Object.values(data).join('","') + '")';

        global.conn.query(query_insert);
        res.send('ok');
    });

    app.get('/pauses/delete/:id', function (req, res) {
        global.conn.query('delete from pauses where pause_id = ' + req.params.id);
        res.redirect('/pauses');
    });
};

exports.default = Pauses;