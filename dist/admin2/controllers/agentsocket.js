'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mysqlEvents = require('@rodrigogs/mysql-events');

var _mysqlEvents2 = _interopRequireDefault(_mysqlEvents);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _mySQL = require('../config/mySQL');

var _mySQL2 = _interopRequireDefault(_mySQL);

var _imgur = require('imgur');

var _imgur2 = _interopRequireDefault(_imgur);

var _vcardparser = require('vcardparser');

var _vcardparser2 = _interopRequireDefault(_vcardparser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

console.log(_vcardparser2.default);

_imgur2.default.setClientId('c76a954c8ee74fc');

var Entrys = function () {
	function Entrys(io, app) {
		var _this = this;

		_classCallCheck(this, Entrys);

		setInterval(function () {
			return _this.refreshCountQueue();
		}, 4000);

		global.conn.query('update tickets set status = "WAITING AGENT", requeue = now() where status = "IN CHAT"');

		this.tickets = { '5': 'dd' };

		setInterval(function () {
			var _this2 = this;

			Object.keys(this.tickets).forEach(function (key) {
				var value = _this2.tickets[key];
				if (!io.sockets.connected.hasOwnProperty(value)) {
					delete _this2.tickets[key];
				}
			});
		}.bind(this), 1000);

		this.io = io;
		this.MySQLWatch();

		var teste = 'Socket.IO is NOT a WebSocket implementation. Although Socket.IO indeed uses WebSocket as a transport when possible, it adds some metadata to each packet: the packet type, the namespace and the packet id when a message acknowledgement is needed. That is why a WebSocket client will not be able to successfully connect to a Socket.IO server, and a Socket.IO client will not be able to connect to a WebSocket server either. Please see the protocol specification here.'.split(' ');
		this.count_queue = [];

		this.refreshCountQueue();

		app.all('/api/message/:instance', async function (req, res) {
			res.send('oi');
			if (!req.body.messages) return;

			console.log('CHEGOU MENSAGEM', req.body.messages.length - 1);

			//req.body.messages.forEach(async message=>{

			var _loop = async function _loop(iii) {
				var message = req.body.messages[iii];
				if (message.self === 1) return {
						v: void 0
					};
				console.log('ChatAPI');

				var connector_external_id = req.params.instance.replace(/[^0-9]/g, '');
				var entry = global.conn.query('select * from entrys where connector_external_id="' + connector_external_id + '"');
				if (!entry[0]) return {
						v: console.log('ERRO ERRO ERRO - ENTRADA NÃO CRIADA ' + req.params.instance)
					};
				entry = entry[0];
				entry.json_data = JSON.parse(entry.json_data);
				var newTicket = false;

				var client = global.conn.query('select client_id from clients where client_external_id ="' + message.chatId + '"');
				console.log('CRIAR NOVO CLIENTE', message.chatId);
				if (!client[0]) {
					var picture = await _this.getPicture(message.chatId, connector_external_id, entry.json_data.token);
					if (message.chatId.indexOf('-') > -1) {
						message.senderName = await _this.getGroupName(entry.entry_id, message.chatId);
					}
					var client_id = global.conn.query('insert into clients set client_name="' + message.senderName + '", client_external_id ="' + message.chatId + '", client_sub_name ="' + message.chatId.split('@')[0] + '",connector="whatsapp", picture="' + picture + '", entry_id = ' + entry.entry_id).insertId;
					console.log('NOVO CLIENTE', message.chatId);
					client = [{ client_id: client_id }];
				}

				var ticket = global.conn.query('select ticket_id from tickets where client_id=' + client[0].client_id + ' and status in ("IN CHAT","WAITING AGENT")');
				if (!ticket[0]) {
					newTicket = true;
					ticket = global.conn.query('insert into tickets (client_id,group_id,entry_id,status) values (' + client[0].client_id + ',' + entry.go_group + ',"' + entry.entry_id + '","WAITING AGENT")').insertId;
					ticket = [{ ticket_id: ticket }];
				}

				if (message.body.indexOf('BEGIN') > -1) {
					message.type = 'vcard';
					message.body = await new Promise(async function (r) {
						_vcardparser2.default.parseString(message.body, function (err, json) {
							console.log(err, json);
							if (err) return r('======= CONTATO COM FALHA =======');
							r(json.fn + 'cOnTaCt|CoNtAcT' + json.tel[0].value);
						});
					});
				}

				var db_message = global.conn.query('insert into messages\
				(\
					id_external,\
					connector,\
					ticket_id,\
					client_id,\
					source,\
					content,\
					type,\
					sender_name\
				) values (\
					"' + message.id + '",\
					"whatsapp",\
					"' + ticket[0].ticket_id + '",\
					"' + client[0].client_id + '",\
					"client",\
					"' + message.body + '",\
					"' + message.type + '",\
					"' + message.senderName + 'zA|Az' + message.author.split('@')[0] + '"\
				)');

				if (!newTicket) return {
						v: void 0
					};

				var variables = { ticket_id: ticket[0].ticket_id };
				var group = global.conn.query('select group_name from groups where group_id = ' + entry.go_group)[0];
				_this.sendMessage(message.chatId, entry.message_start.replace(/{{(.*)+}}/g, function (a) {
					return eval('variables[\'' + a.replace(/}|{/g, '') + '\']');
				}) + ' Você está na fila *' + group.group_name + '*', entry.connector_external_id, entry.json_data.token);
			};

			for (var iii = 0; iii <= req.body.messages.length - 1; iii++) {
				var _ret = await _loop(iii);

				if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
			}
		});

		io.on('connection', function (socket, a) {
			var _this3 = this;

			this.refreshCountQueue();
			socket.handshake.query.status = ['ONLINE'];
			var groups = socket.handshake.query.groups;
			var user_id = socket.handshake.query.user_id;

			Object.values(this.io.sockets.clients().sockets).filter(function (_socket) {
				if (_socket.handshake.query.user_id == user_id && socket !== _socket) {
					console.log('conflito');
					_socket.emit('conflit', true);
				}
			});

			socket.handshake.query.groups = socket.handshake.query.groups.split(',');
			console.log('Um cliente acessou o socket');

			socket.on('disconnect', function () {
				Object.keys(_this3.tickets).forEach(function (key) {
					var value = _this3.tickets[key];
					if (value == socket.id) {
						delete _this3.tickets[key];
					}
				});
				global.conn.query('select client_id,entry_id from tickets where status = \'IN CHAT\' and user_id = ' + socket.handshake.query.user_id).forEach(function (line) {
					console.log('oi');

					var entry = global.conn.query('select * from entrys where entry_id=' + line.entry_id);
					entry[0].json_data = JSON.parse(entry[0].json_data);
					var client = global.conn.query('select client_external_id from clients where client_id=' + line.client_id);
					var user = global.conn.query('select name,apelido from users where user_id=' + socket.handshake.query.user_id);
					_this3.sendMessage(client[0].client_external_id, '*[ROBÔ KONTAC]* ' + user[0].apelido + ' saiu do chat', entry[0].connector_external_id, entry[0].json_data.token);
				});
				global.conn.query('update tickets set status = "WAITING AGENT", requeue = now() where status = \'IN CHAT\' and user_id = ' + socket.handshake.query.user_id);
			});

			socket.on('transfer_chat', function (e) {
				if (e.to_group && e.ticket_id) {
					delete _this3.tickets[e.ticket_id];
					var _ticket = global.conn.query('select * from tickets where ticket_id = ' + e.ticket_id)[0];
					var o_group = global.conn.query('select * from groups where group_id = ' + _ticket.group_id)[0];

					global.conn.query('update tickets set status = \'WAITING AGENT\', group_id = ' + e.to_group + ', requeue = now() where ticket_id = ' + e.ticket_id);

					var d_group = global.conn.query('select * from groups where group_id = ' + e.to_group)[0];
					var user = global.conn.query('select * from users where user_id = ' + _ticket.user_id)[0];
					var data = {
						id_external: "",
						connector: 'whatsapp',
						user_id: _ticket.user_id,
						ticket_id: e.ticket_id,
						client_id: _ticket.client_id,
						source: 'agent',
						content: o_group.group_name + 'pH|Hp' + d_group.group_name,
						type: 'transfer',
						sender_name: user.name + "zA|Az" + user_id
					};
					var sql = 'insert into messages (' + Object.keys(data).join() + ') values ("' + Object.values(data).join('","') + '")';
					global.conn.query(sql);
				} else {
					socket.emit('show_transfer_list', {
						groups: global.conn.query('select group_id, group_name from groups').map(function (a) {

							a.agent_counts = Object.values(_this3.io.sockets.clients().sockets).filter(function (socket) {
								return socket.handshake.query.groups.filter(function (group) {
									return group == a.group_id;
								}) > 0;
							}).length;
							return a;
						})
					});
				}
			});

			socket.handshake.query.statusUpdated = Date.now();

			socket.on('set_pause', function (data) {
				socket.handshake.query.statusUpdated = Date.now();
				if (data.pause === 'ONLINE') {
					socket.handshake.query.status = ['ONLINE', data.pause];
				} else {
					global.conn.query('update tickets set status = "WAITING AGENT",requeue=now(), user_id = null where status = "IN CHAT" and user_id=' + socket.handshake.query.user_id);
					Object.keys(_this3.tickets).forEach(function (key) {
						var value = _this3.tickets[key];
						if (value == socket.id) {
							delete _this3.tickets[key];
						}
					});
					socket.handshake.query.status = ['pause', data.pause];
				}
				socket.emit('update_pause', socket.handshake.query.status);
			});

			socket.emit('login_data', {
				groups: ['a']
			});

			/*let timer_count_queue = setInterval(function (){
   	if(!socket.connected){
   		clearInterval(timer_count_queue)
   		timer_count_queue = null
   	}
   	let count = 0;
   	let groups_split = groups.split(',')
   	console.log(this.count_queue)
   	this.count_queue.forEach(line=>{
   		if(groups_split.indexOf(''+line.group_id)>-1){
   			count+=line.count
   		}
   	})
   	socket.emit('queue_count',count)
   },1000);*/

			socket.on('take', function () {
				console.log('Clinete puxou atendimento');
				var queue = global.conn.query('select * from tickets where group_id in (' + groups + ') and status="WAITING AGENT" order by requeue limit 1');
				var chat = void 0;
				if (queue[0]) {
					global.conn.query('update tickets set status = "IN CHAT", user_id = ' + user_id + ' where ticket_id = ' + queue[0].ticket_id);
					var _client = global.conn.query('select * from clients where client_id = ' + queue[0].client_id);
					//let messages = global.conn.query('select * from messages where ticket_id = '+queue[0].ticket_id+' order by sended_at desc');
					var messages = global.conn.query('select * from messages where client_id = ' + queue[0].client_id + ' order by sended_at desc');
					chat = {
						ticket_id: queue[0].ticket_id,
						group_id: queue[0].group_id,
						name: _client[0].client_name,
						client_external_id: _client[0].client_external_id,
						sub: _client[0].client_sub_name,
						entry_id: queue[0].entry_id,
						client_id: _client[0].client_id,
						picture: '',
						chat: messages.reverse().map(function (a) {
							return {
								source: a.source === 'agent' ? 'out' : 'in',
								msg: a.content,
								time: a.sended_at,
								ticket_id: a.ticket_id,
								type: a.type,
								sender_name: a.sender_name
							};
						})
					};

					this.tickets[queue[0].ticket_id] = socket.id;

					var _entry = global.conn.query('select * from entrys where entry_id = ' + queue[0].entry_id);
					_entry[0].json_data = JSON.parse(_entry[0].json_data);
					var user = global.conn.query('select * from users where user_id = ' + socket.handshake.query.user_id);
					this.sendMessage(_client[0].client_external_id, '*[ROBÔ KONTAC]* *' + user[0].apelido + '* entrou no chat', _entry[0].connector_external_id, _entry[0].json_data.token);
					console.log('agora busca foto');
					chat.picture = _client[0].picture;
					socket.emit('chat', chat);
					this.refreshCountQueue();
					/*this.getPicture(client[0].client_external_id, entry[0].connector_external_id , entry[0].json_data.token, function (picture){
     	if(picture===' ' || picture===''){
     	}
     	chat.picture = picture
     	socket.emit('chat',chat);
     	console.log('Mandou o chat')
     	this.refreshCountQueue();
     }.bind(this))*/
				} else {
					socket.emit('queue_count', 0);
					socket.emit('queue_empty_alert', true);
				}
			}.bind(this));

			socket.on('out_message', function (msg) {
				var user_id = socket.handshake.query.user_id;
				var user = global.conn.query('select name from users where user_id = ' + user_id)[0];
				var data = {
					id_external: "",
					connector: 'whatsapp',
					user_id: user_id,
					ticket_id: msg.ticket_id,
					client_id: msg.client_id,
					source: 'agent',
					content: msg.msg,
					sender_name: user.name + "zA|Az" + user_id
				};
				var sql = 'insert into messages (' + Object.keys(data).join() + ') values ("' + Object.values(data).join('","') + '")';
				global.conn.query(sql);

				var client_number = global.conn.query('select clients.client_external_id from tickets inner join clients on tickets.client_id=clients.client_id where ticket_id = ' + msg.ticket_id);
				var apelido = global.conn.query('select apelido from users where user_id=' + user_id)[0].apelido;
				var entry = global.conn.query('select * from entrys where entry_id = ' + msg.entry_id);
				entry[0].json_data = JSON.parse(entry[0].json_data);
				_this3.sendMessage(client_number[0].client_external_id, "*" + apelido + ":* " + msg.msg, entry[0].connector_external_id, entry[0].json_data.token);
			});

			socket.on('end_chat', function (_ref) {
				var ticket_id = _ref.ticket_id,
				    group_id = _ref.group_id,
				    status = _ref.status;

				if (status) {
					delete _this3.tickets[ticket_id];
					_this3.sendMessageByTicketId('*[ROBÔ KONTAC]* Esse atendimento foi finalizado', ticket_id);
					global.conn.query('update tickets set status = "' + status + '" where ticket_id = ' + ticket_id);
					_this3.refreshCountQueue();
				} else {
					//global.conn.query('update tickets set status = "ENDED" where ticket_id = '+ticket_id);
					var statuses = global.conn.query('select statuses from groups where group_id=' + group_id)[0].statuses;
					socket.emit('end_chat', statuses);
				}
			});

			socket.on('set_tickets', function (data) {
				data.forEach(function (ticket_id) {
					return _this3.tickets[ticket_id] = socket.id;
				});
			});
		}.bind(this));
	}

	_createClass(Entrys, [{
		key: 'getGroupName',
		value: async function getGroupName(entry_id, chatId) {
			var entry = global.conn.query('select json_data, connector_external_id from entrys where connector="whatsapp" and entry_id =' + entry_id)[0];
			if (!entry) return 'Grupo sem nome';
			var json_data = JSON.parse(entry.json_data);
			return await new Promise(function (r) {
				(0, _request2.default)('https://api.chat-api.com/instance' + entry.connector_external_id + '/dialogs?token=' + json_data.token, function (err, res, body) {
					body = JSON.parse(body);
					var chat = body.dialogs.filter(function (a) {
						return a.id === chatId;
					})[0];
					if (chat) {
						return r('[GRUPO] ' + chat.name);
					} else {
						return r('Grupo sem nome');
					}
				});
			});
		}
	}, {
		key: 'getPicture',
		value: async function getPicture(external_id, instance, token, cb) {
			return await new Promise(function (r) {
				(0, _request2.default)('https://api.chat-api.com/instance' + instance + '/dialogs?token=' + token, function (err, res, body) {
					body = JSON.parse(body);
					var chat = body.dialogs.filter(function (a) {
						return a.id === external_id;
					});
					if (chat[0]) {
						if (chat[0].image == '' || chat[0].image == ' ') {
							chat[0].image = 'https://i.imgur.com/0oZIE1v.jpg';
						}

						_imgur2.default.uploadUrl(chat[0].image).then(function (json) {
							r(json.data.link);
						}).catch(function (err) {
							r('https://i.imgur.com/0oZIE1v.jpg');
						});
					} else {
						r('https://i.imgur.com/0oZIE1v.jpg');
					}
				});
			});
		}
	}, {
		key: 'refreshCountQueue',
		value: function refreshCountQueue() {
			var count_queue = global.conn.query("select group_id, count(*) count from tickets where status = 'WAITING AGENT' group by group_id;");
			Object.values(this.io.sockets.clients().sockets).forEach(function (socket) {
				var groups = socket.handshake.query.groups;
				if (typeof groups === 'string') {
					groups = groups.split(',');
				}
				var count = count_queue.filter(function (a) {
					return groups.indexOf('' + a.group_id) > -1;
				});
				if (count.length > 1) {
					count = count.reduce(function (a, b) {
						return a.count + b.count;
					});
				} else if (count.length === 1) {
					count = count[0].count;
				} else {
					count = 0;
				}
				socket.emit('queue_count', count);
			});
		}
	}, {
		key: 'sendMessageByTicketId',
		value: function sendMessageByTicketId(msg, ticket_id) {
			console.log('---', msg, ticket_id);
			var ticket = global.conn.query('select t.client_id,e.json_data, e.connector_external_id from tickets t inner join entrys e on e.entry_id = t.entry_id where t.ticket_id = ' + ticket_id);
			if (ticket[0]) {
				ticket = ticket[0];
				var _client2 = global.conn.query('select client_external_id from clients where client_id = ' + ticket.client_id)[0];
				ticket.json_data = JSON.parse(ticket.json_data);
				this.sendMessage(_client2.client_external_id, msg, ticket.connector_external_id, ticket.json_data.token);
			} else {
				return false;
			}
		}
	}, {
		key: 'sendMessage',
		value: function sendMessage(number, msg, instance, token) {
			console.log(number, msg);
			(0, _request2.default)({
				url: 'https://api.chat-api.com/instance' + instance + '/sendMessage?token=' + token,
				method: "POST",
				json: {
					chatId: number,
					body: msg
				}
			}, function (a, b, c) {
				console.log(b.body);
			});
		}
	}, {
		key: 'MySQLWatch',
		value: async function MySQLWatch() {
			var _this4 = this;

			var instance = new _mysqlEvents2.default({
				user: _mySQL2.default.username,
				password: _mySQL2.default.password,
				host: _mySQL2.default.host
			}, {
				startAtEnd: true
			});

			await instance.start();

			instance.addTrigger({
				name: 'Whole database instance',
				statement: _mysqlEvents2.default.STATEMENTS.ALL,
				expression: 'kontac',
				onEvent: function onEvent(e) {
					if (e.table === 'tickets') {
						if (e.type === 'INSERT') {
							_this4.refreshCountQueue();
						}

						if (e.type === 'UPDATE' && e.affectedColumns.indexOf('status') > -1) {
							_this4.refreshCountQueue();
							e.affectedRows.forEach(function (_ref2) {
								var after = _ref2.after;

								global.conn.query('insert into ticket_log values (0,' + after.ticket_id + ', \'' + after.status + '\', \'' + after.user_id + '\', now())');
							});
						}
					} else if (e.table === 'messages' && e.type === 'INSERT') {
						e.affectedRows.forEach(function (_ref3) {
							var after = _ref3.after;

							if (after.source === 'client' && _this4.tickets[after.ticket_id]) {
								Object.values(_this4.io.sockets.clients().sockets).forEach(function (socket) {
									if (socket.id === _this4.tickets[after.ticket_id]) {
										console.log('-*-----', after.type, after);
										socket.emit('message_in', {
											source: 'client',
											msg: after.content,
											type: after.type,
											sender_name: after.sender_name,
											time: new Date(),
											message_id: after.message_id,
											ticket_id: after.ticket_id
										});
									}
								});
							}
							if (after.type === 'transfer') {
								console.log('TRANSFERENCIA');
								var filas = after.content.split('pH|Hp');
								var user = after.sender_name.split('zA|Az');
								var _client3 = global.conn.query('select * from clients where client_id = ' + after.client_id)[0];
								var _entry2 = global.conn.query('select * from entrys where entry_id = ' + _client3.entry_id)[0];
								_entry2.json_data = JSON.parse(_entry2.json_data);
								console.log(1);
								var client_external_id = global.conn.query('select client_external_id from clients where client_id = ' + after.client_id)[0].client_external_id;
								console.log(2);
								console.log(client_external_id, user, filas, _entry2.connector_external_id, _entry2.json_data.token);
								_this4.sendMessage(client_external_id, '*[ROBÔ KONTAC]* Você foi transferido por *' + user[0] + '*, da fila *' + filas[0] + '* pra fila *' + filas[1] + '*', _entry2.connector_external_id, _entry2.json_data.token);
								console.log(3);
							}
						});
					}
				}
			});

			instance.on(_mysqlEvents2.default.EVENTS.CONNECTION_ERROR, console.error);
			instance.on(_mysqlEvents2.default.EVENTS.ZONGJI_ERROR, console.error);
		}
	}]);

	return Entrys;
}();

exports.default = Entrys;