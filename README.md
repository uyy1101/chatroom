# nodeJS socket 多个房间的聊天室

>  nodeJS socket聊天室。接触nodejs 发现nodejs的一些模块对于socket编程还是挺方便的。下面我讲讲解一下nodejs 如何构建聊天室



### 目录介绍

```
Chatroom 
 --lib
    --chat_server.js  socketIO编程 在server中引用
 --node_modules
 --public 静态文件目录
    --css
       --style.css  静态css
          
    --js
       --chat.js 连接socket类
       --chat_ui.js 处理socket信息UI控制
    index.html
 --package.json
 --server.js 主入口文件
 --Readme.md 介绍
```


- 运用了模块 socket-io 、mime、 fs、 path、http模块


使用方式：
```$node
1.node server.js 
2.打开浏览器输入 127.0.0.1:8889(端口号可在server.js里面更改，默认为8889)
```

```$node
输入 /join roomname 更换房间号
输入 /nick username 更换个人姓名
直接输入 发送个人聊天信息
```


代码里面都有注释。


下面是附上github 地址 :
[github地址](http://www.github.com/)

