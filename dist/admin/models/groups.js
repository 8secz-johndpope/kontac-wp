'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GroupModel = function () {
    function GroupModel() {
        _classCallCheck(this, GroupModel);
    }

    _createClass(GroupModel, [{
        key: 'get',
        value: function get(_w) {
            var query = 'select * from groups';
            if (_w) {
                query += " where " + _w;
            }
            return global.conn.query(query);
        }
    }, {
        key: 'getCountAgents',
        value: function getCountAgents(group) {
            return global.conn.query('select count(*) count from users_groups where group_id = ' + group)[0].count;
        }
    }, {
        key: 'delete',
        value: function _delete(group_id) {
            global.conn.query('delete from users_groups where group_id=' + group_id);
            global.conn.query('delete from groups where group_id=' + group_id);
        }
    }, {
        key: 'insert',
        value: function insert(data) {
            return global.conn.query('insert into groups (' + Object.keys(data).join() + ') values ("' + Object.values(data).join('","') + '")');
        }
    }, {
        key: 'insertUsersGroups',
        value: function insertUsersGroups(user, group) {
            return global.conn.query('insert ignore users_groups values (' + group + ',' + user + ')');
        }
    }, {
        key: 'getUsersSelected',
        value: function getUsersSelected(group_id) {
            return global.conn.query('select user_id from users_groups where group_id = ' + group_id);
        }
    }, {
        key: 'update',
        value: function update(group_id, data) {
            return global.conn.query('update groups set ' + Object.keys(data).map(function (a) {
                return a + '="' + data[a] + '"';
            }) + ' where group_id=' + group_id);
        }
    }, {
        key: 'deleteAllSelected',
        value: function deleteAllSelected(group_id) {
            return global.conn.query('delete from users_groups where group_id = ' + group_id);
        }
    }]);

    return GroupModel;
}();

exports.default = new GroupModel();