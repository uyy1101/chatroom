/**
 * Created by Administrator on 2017/3/16.
 */

var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nicknames = {};//存在所有的用户名字
var nameUsed = [];//已经使用了的用户名字
var currentRoom = {};


exports.listen = function (server) {
    io = socketio.listen(server);//启动socket  IO服务器允许它搭建在已有的HTTP服务器上
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        guestNumber = assignGuestName(socket, guestNumber, nicknames, nameUsed); //分配用户姓名
        joinRoom(socket, 'Lobby');  //用户第一次进来，把用户放在Lobby聊天室里面 ,做处理
        handleMessageBroadcasting(socket, nicknames);
        handleNameChangeAttempts(socket, nicknames, nameUsed);
        handleRoomJoining(socket);
        socket.on('rooms', function () {
            socket.emit('rooms', io.sockets.manager.rooms)
        });
        handleClinetDisconnection(socket, nicknames, nameUsed); //用户断开处理逻辑
    });

    /**
     *
     * @param socket
     * @param guestNumber 人数+1 用户进聊天室分配临时名
     * @param nicknames 所有人名字集合
     * @param nameUsed  已经存在的名字
     * @returns {*}
     *
     */
    function assignGuestName(socket, guestNumber, nicknames, nameUsed) {
        var name = 'Guest' + guestNumber;
        nicknames[socket.id] = name;
        socket.emit('nameResult',
            {
                success: true,
                name: name
            });
        nameUsed.push(name);
        return guestNumber + 1;
    }

    /**
     * 加入房间发送信息给房间内其他用户
     * @param socket
     * @param room  房间名称
     */
    function joinRoom(socket, room) {

        socket.join(room);
        currentRoom[socket.id] = room;
        socket.emit('joinResult', {room: room});
        socket.broadcast.to(room).emit('message', {text: nicknames[socket.id] + 'has join' + room + '.'});
        var usersInRoom = io.sockets.clients(room); //获取当前房间内，所有的用户socket.id
        if (usersInRoom.length > 1) {
            var usersInRoomSummary = 'User currently in ' + room + ':';
            for (var index in usersInRoom) {
                var userSocketId = usersInRoom[index].id;
                if (userSocketId != socket.id) {
                    if (index > 0) {
                        usersInRoomSummary += ', ';
                    }
                    usersInRoomSummary += nicknames[userSocketId];
                }
            }
        }
        socket.emit('message', {text: usersInRoomSummary});
    }

    /**
     * 更换个人名字
     * @param socket
     * @param nicknames
     * @param nameUsed
     */
    function handleNameChangeAttempts(socket, nicknames, nameUsed) {
        socket.on('nameAttempt', function (name) {
            if (name.indexOf('Guest') == 0) {

                socket.emit('nameResult',
                    {
                        success: false,
                        message: 'name canot begin with Guest'
                    });
            } else {
                if (nameUsed.indexOf('Guest') == -1) {
                    var previousName = nicknames[socket.id];
                    var previousNameIndex = nameUsed.indexOf(previousName);
                    nameUsed.push(name);
                    nicknames[socket.id] = name;
                    delete nameUsed[previousNameIndex];
                    socket.emit('nameResult',
                        {
                            success: true,
                            name: name
                        });
                    socket.broadcast.to(currentRoom[socket.id]).emit('message', {text: previousName + 'is now known as ' + name + '.'});
                } else {
                    socket.emit('nameResult', {
                        success: false,
                        message: 'The name is used'
                    });
                }
            }
        });
    }

    /**
     * 发送信息给当前房间用户
     * @param socket
     */
    function handleMessageBroadcasting(socket) {
        socket.on('message', function (message) {
            socket.broadcast.to(message.room).emit(
                'message',
                {
                    text: nicknames[socket.id] + ':' + message.text
                })
        });
    }


    /**
     * 更换房间
     * @param socket
     */
    function handleRoomJoining(socket) {
        socket.on('join', function (room) {
            socket.leave(currentRoom[socket.id]);
            joinRoom(socket, room.newRoom);
        });
    }


    /**
     * 用户使用退出函数
     * @param socket
     * @param nicknames
     * @param nameUsed
     */
    function handleClinetDisconnection(socket, nicknames, nameUsed) {

        socket.on('disconnect', function () {
            var index = nameUsed.indexOf(nicknames[socket.id]);
            socket.broadcast.to(currentRoom[socket.id]).emit('message',
                {
                    text: nicknames[socket.id] + '已退出该房间'
                });
            delete nicknames[socket.id];
            delete nameUsed[index];

        });

    }


};
