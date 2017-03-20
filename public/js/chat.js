/**
 * Created by Administrator on 2017/3/16.
 */

var Chat = function (socket) {

    this.socket = socket;
};

/**
 * 发送信息
 * @param room
 * @param text
 */
Chat.prototype.sendMessage = function (room, text) {
    var message = {
        room: room,
        text: text
    };
    this.socket.emit('message', message);
};

/**
 * 变更房间信息
 * @param room
 */
Chat.prototype.joinRoom = function (room) {
    this.socket.emit('join', {
        newRoom: room
    })
};


/**
 * 处理发送信息过来的逻辑
 * 当过来的为/join 时，更改房间号
 * 当过来的是/nick 时 更改昵称
 * @param command
 * @returns {boolean}
 */
Chat.prototype.processCommand = function (command) {
    var words = command.split(' ');
    var command = words[0].substring(1, words[0].length).toLowerCase();
    var message = false;

    switch (command) {
        case 'join':
            words.shift();
            var room = words.join(' ');
            this.joinRoom(room);
            break;

        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.socket.emit('nameAttempt', name);
            break;
        default:
            message = 'Unrecongnized command';
            break;
    }
    return message
};
