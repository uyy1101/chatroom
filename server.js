/**
 * Created by Administrator on 2017/3/16.
 */

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var port = 0;
var cache = {}; //静态cache


/**
 * 404页面
 * @param response
 */
function show404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404 not found');
    response.end();

}


function sendFile(response, filePath, fileContents) {
    response.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
    response.end(fileContents);

}

/**
 * 静态请求
 * @param response
 * @param cache
 * @param absPath
 */
function serverStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath])
    } else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        show404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                show404(response);
            }
        });
    }
}

if (port == 0) {
    port = 8889;
}

var server = http.createServer(function (request, response) {
    var filepath = false;
    if (request.url == '/') {
        console.log(request.url);
        filepath = 'public/index.html';
    } else {
        filepath = 'public/' + request.url;

    }
    var abspath = './' + filepath;
    serverStatic(response, cache, abspath);
}).listen(port);
console.log('start');
var chatServer = require('./lib/chat_server');
chatServer.listen(server);
