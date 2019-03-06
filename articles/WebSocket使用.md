# WebSocket 使用

**WebSockets** 是一个可以创建和服务器间进行双向会话的高级技术。通过这个API你可以向服务器发送消息并接受基于事件驱动的响应，这样就不用向服务器轮询获取数据了。

##建立连接

```js
const connection = new WebSocket('ws://html5rocks.websocket.org/echo', ['soap', 'xmpp']);
```

ws:为了websocket连接而使用的新的url协议方案，wss：与https一样，是为了安全的websocket连接

第二个参数接收可选的subprotocols，可以是string 或者 string array，每个string表示一个 subprotocol name，服务器只接受传入的数组中的所有subprotocols的一个，通过访问WebSocket对象的 protocol property可以知道被接受的subprotocol

The subprotocol names must be one of registered subprotocol names in [IANA registry](http://www.iana.org/assignments/websocket/websocket.xml).

```js
// When the connection is open, send some data to the server
connection.onopen = function () {
  connection.send('Ping'); // Send the message 'Ping' to the server
};

// Log errors
connection.onerror = function (error) {
  console.log('WebSocket Error ' + error);
};

// Log messages from the server
connection.onmessage = function (e) {
  console.log('Server: ' + e.data);
};
```

在连接上添加event handler处理连接建立、接收消息、连接关闭、发生错误等事件

建立连接后返回一个WebSocket对象，其属性如下

##属性 

- url： 传入构造器的URL。它必须是一个绝对地址的URL。**只读**。
- protocol 一个表明服务器选定的子协议名字的字符串。这个属性会被取值为构造器传入的protocols参数之一。
- readyState 常量  连接的当前状态。

  - 0  CONNECTING  连接还没开启
  - 1 OPEN 连接已开启并准备好进行通信
  - 2 CLOSING 连接正在关闭中
  - 3 CLOSED 连接已经关闭，或者连接无法建立。
- 事件监听器

  - onopen  当`readyState`的值变为 OPEN 的时候会触发该事件。接收一个名为"open"的事件对象。
  - onerror   错误发生时，会接收一个名为“error”的event对象。
  - onmessage 当有消息到达的时候该事件会触发。这个Listener会被传入一个名为"message"的[` MessageEvent `](https://developer.mozilla.org/en/WebSockets/WebSockets_reference/MessageEvent)对象。
  - onclose    当 WebSocket 对象的readyState 状态变为 CLOSED 时会触发该事件。这个监听器会接收一个叫close的[` CloseEvent`](https://developer.mozilla.org/en/WebSockets/WebSockets_reference/CloseEvent) 对象。
- binaryType 一个字符串，用来指定从服务器接收的的二进制的内容的类型。取值应当是"blob"或者"arraybuffer"。
- bufferedAmount
- extensions  连接开启后。可用来查看服务器接受的extensions类型

## 发送数据

方法: send()     通过WebSocket连接向服务器发送数据。

```js
void send(in DOMString data);
void send(in ArrayBuffer data);
void send(in Blob data); 
```

参数：

- data 要发送到服务器的数据。

异常：

- INVALID_STATE_ERR : 当前连接的状态不是`OPEN`。
- SYNTAX_ERR : 数据是一个包含unpaired surrogates的字符串。即字符串中包含超出 the range from U+D800 to U+DFFF.的code point

当我们连接到服务器，可以使用send方法向服务器发送数据，支持字符串或者二进制数据（`Blob` or `ArrayBuffer` 对像）

```js
// Sending String
connection.send('your message');

// Sending canvas ImageData as ArrayBuffer
var img = canvas_context.getImageData(0, 0, 400, 320);
var binary = new Uint8Array(img.data.length);
for (var i = 0; i < img.data.length; i++) {
  binary[i] = img.data[i];
}
connection.send(binary.buffer);

// Sending file as Blob
var file = document.querySelector('input[type="file"]').files[0];
connection.send(file);
```

## 接收数据

相对地，服务器在任意时刻也会发送消息到浏览器，这会触发onmessage回调，回调函数接收事件对象，通过data属性来获取接受到的消息。同时websocket也能接收二进制的数据（既能发送，也能接收），二进制数据（ Binary frames ）通过`Blob` 或者 `ArrayBuffer` 的格式接收，通过WebSocket对象的binaryType 属性来指定接收二进制数据的格式（Blob或者ArrayBuffer）默认格式为Blob (不需要在发送二进制数据的时候指定binaryType 参数)

```js
// Setting binaryType to accept received binary as either 'blob' or 'arraybuffer'
connection.binaryType = 'arraybuffer';
connection.onmessage = function(e) {
  console.log(e.data.byteLength); // ArrayBuffer object if binary
};
```

还有一个特性是extensions，通过extensions,it will be possible to send frames [compressed](http://tools.ietf.org/html/draft-tyoshino-hybi-websocket-perframe-deflate-05), [multiplexed](http://tools.ietf.org/html/draft-tamplin-hybi-google-mux-02) 可以通过WebSocket对象的 extensions属性（在连接open之后）来查看服务器接受的extensions

## 关闭连接

方法： close() 关闭WebSocket连接或停止正在进行的连接请求。如果连接的状态已经是`closed`，这个方法不会有任何效果

```js
void close(in optional unsigned short code, in optional DOMString reason);
```

参数：

- code 可选，一个表示关闭连接的状态号，表示关闭连接的原因，默认为1000(正常关闭)，  [list of status codes](https://developer.mozilla.org/en/WebSockets/WebSockets_reference/CloseEvent#Status_codes)
- reason 可选 一个可读的字符串，表示连接被关闭的原因。这个字符串必须是不长于123字节的UTF-8 文本

异常：
- INVALID_ACCESS_ERR     选定了无效的code。
- SYNTAX_ERR    reason 字符串太长或者含有unpaired surrogates。

## 跨域Communication

跨域对于Websocket来说是简单的， WebSocket enables communication between parties on any domain.由服务器决定是否将服务提供给所有的客户端或者位于the set of well defined domains中的客户端，对于客户端来说，应该确保与值得信任的服务器通信

## 代理服务器

新技术到来也带有问题，在大多数情况下，WebSocket兼容大部分网络中处理HTTP连接的代理服务器，WebSocket 协议使用升级系统（ the HTTP upgrade system） (which is normally used for HTTP/SSL) 来 "upgrade" 一个 HTTP 连接 到一个 WebSocket 连接。 但是有些代理服务器不会这样做，因此它会直接drop掉这样的连接， 因此即使客户端使用WebSocket协议，连接也不一定会建立成功

## 使用场景

当需要低延迟的或者客户端与服务器需要接近实时的连接时，需要注意的是，这时候服务器应用可能需要像`事件队列` 这样的技术。场景样例如下

- Multiplayer online games
- Chat applications
- Live sports ticker
- Realtime updating social streams


