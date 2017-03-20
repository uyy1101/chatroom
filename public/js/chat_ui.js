/**
 * Created by Administrator on 2017/3/16.
 */

/**
 * 生成信息div 块
 * @param message
 * @returns {*|jQuery}
 */
function divEscapedContentElement(message) {

    return $('<div></div>').text(message);
}

/**
 * 系统信息div块生成
 * @param message
 * @returns {*|jQuery}
 */
function divSysContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>')

}
/**
 * 处理用户input 信息
 * @param chatApp
 * @param socket
 */
function processUserInput(chatApp, socket) {
    var message = $('#send-message').val();
    var systemMessage;
    if (message.charAt(0) == '/') {
        systemMessage = chatApp.processCommand(message);
        if (systemMessage) {
            $('#messages').append(divSysContentElement(systemMessage));
        }
    } else {
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));

    }
    $('#send-message').val('');

}

var socket = io.connect(); //打开io
$(document).ready(function () {
    var chatApp = new Chat(socket);
    socket.on('nameResult', function (result) {
        var message;
        if (result.success) {
            message = 'You are now known as ' + result.name + '.';
        } else {
            alert(result.message);

        }
        $('#messages').append(divEscapedContentElement(message));
    });

    socket.on('joinResult', function (result) {
        $('#room').text(result.room);
        $('#messages').append(divSysContentElement(result.room + ' change'));

    });
    socket.on('message', function (message) {
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });
    socket.on('rooms', function (rooms) {
        $('#room-list').empty();
        for (var room in rooms) {
            room = room.substring(1, room.length);
            if (room != '') {
                $('#room-list').append(divEscapedContentElement(room));
            }
        }
    });


    setInterval(function () {
        socket.emit('rooms');
    }, 5000);


    $('#send-message').focus();
    $('#send-form').submit(function () {
        processUserInput(chatApp, socket);
        return false;
    });
});
