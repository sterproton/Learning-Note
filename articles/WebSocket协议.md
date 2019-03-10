# WebSocket协议

## 简介

WebSocket是种在单个TCP连接上进行全双工通信的协议。WebSocket使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。在WebSocket API中，浏览器和服务器只需要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。

## 优点

- 较少的控制开销。在连接创建后，服务器和客户端之间交换数据时，用于协议控制的数据包头部相对较小。
- 更强的实时性。由于协议是全双工的，所以服务器可以随时主动给客户端下发数据。相对于HTTP请求需要等待客户端发起请求服务端才能响应，延迟明显更少；即使是和Comet等类似的[长轮询](https://zh.wikipedia.org/w/index.php?title=%E9%95%BF%E8%BD%AE%E8%AF%A2&action=edit&redlink=1)比较，其也能在短时间内更多次地传递数据。
- 保持连接状态。

- 更好的二进制支持。Websocket定义了[二进制](https://zh.wikipedia.org/wiki/%E4%BA%8C%E8%BF%9B%E5%88%B6)帧，相对HTTP，可以更轻松地处理二进制内容。
- 可以支持扩展。Websocket定义了扩展，用户可以扩展协议、实现部分自定义的子协议。如部分浏览器支持[压缩](https://zh.wikipedia.org/wiki/%E6%95%B0%E6%8D%AE%E5%8E%8B%E7%BC%A9)等。

## 握手过程

WebSocket是独立的，创建于TCP上的协议，它通过HTTP/1.1协议的101状态码来进行握手为了创建Websocket连接，需要通过浏览器发出握手请求，之后服务器进行握手回应，这个过程通常称为“[握手](https://zh.wikipedia.org/wiki/%E6%8F%A1%E6%89%8B_(%E6%8A%80%E6%9C%AF))”（handshaking）。

### 客户端请求

```html
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
Origin: http://example.com
```
客户端可以在这里请求扩展和子协议（extensions and/or subprotocols）Also, common headers like `User-Agent`, `Referer`, `Cookie`, or authentication headers might be there as well. 这些常用的头部都可以加上，它们并不会跟WebSocket相关，忽视它们也是安全的，在许多常见的设置中，反向代理已经处理了它们。

如果头部是难以理解或者有错误的值，服务器应该发送400 Bad Request，然后立刻关闭套接字。As usual, it may also give the reason why the handshake failed in the HTTP response body, but the message may never be displayed (browsers do not display it). If the server doesn't understand that version of WebSockets, it should send a `Sec-WebSocket-Version` header back that contains the version(s) it does understand

### 服务器回应

```html
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
Sec-WebSocket-Protocol: chat
```

除了Upgrade、Connection头部外，客户端会发送一个包含用base64编码过的随机字节的头部，然后服务器会在`Sec-WebSocket-Accept` header中回复一个base64编码的hash，该hash是由Sec-WebSocket-Key加上一个magic数再通过[SHA-1](https://en.wikipedia.org/wiki/SHA-1) 算法生成的。这是为了防止缓存代理重新发送过去的Websocket会话  （The hashing function appends the fixed string `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` (a [GUID](https://en.wikipedia.org/wiki/GUID)) to the value from `Sec-WebSocket-Key` header (which is not decoded from base64), applies the [SHA-1](https://en.wikipedia.org/wiki/SHA-1) hashing function, and encodes the result using base64）

除此之外，服务器可以在hanshake response中决定扩展和子请求（ extension/subprotocol）

### 保持对客户端的追踪（Keeping track of clients）

This doesn't directly relate to the WebSocket protocol, but it's worth mentioning here: your server will have to keep track of clients' sockets so you don't keep handshaking again with clients who have already completed the handshake. The same client IP address can try to connect multiple times (but the server can deny them if they attempt too many connections in order to save itself from [Denial-of-Service attacks](https://en.wikipedia.org/wiki/Denial_of_service)).

## 数据帧

```
      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+
```
针对前面的格式概览图，这里逐个字段进行讲解，如有不清楚之处，可参考协议规范，或留言交流。

**FIN**：1个比特。

如果是1，表示这是消息（message）的最后一个分片（fragment），如果是0，表示不是是消息（message）的最后一个分片（fragment）。

**RSV1, RSV2, RSV3**：各占1个比特。

一般情况下全为0。当客户端、服务端协商采用WebSocket扩展时，这三个标志位可以非0，且值的含义由扩展进行定义。如果出现非零的值，且并没有采用WebSocket扩展，连接出错。

**Opcode**: 4个比特。

操作代码，Opcode的值决定了应该如何解析后续的数据载荷（data payload）。如果操作代码是不认识的，那么接收端应该断开连接（fail the connection）。可选的操作代码如下：

- %x0：表示一个延续帧。当Opcode为0时，表示本次数据传输采用了数据分片，当前收到的数据帧为其中一个数据分片。
- %x1：表示这是一个文本帧（frame）
- %x2：表示这是一个二进制帧（frame）
- %x3-7：保留的操作代码，用于后续定义的非控制帧。
- %x8：表示连接断开。
- %x8：表示这是一个ping操作。
- %xA：表示这是一个pong操作。
- %xB-F：保留的操作代码，用于后续定义的控制帧。

**Mask**: 1个比特。

表示是否要对数据载荷进行掩码操作。从客户端向服务端发送数据时，需要对数据进行掩码操作；从服务端向客户端发送数据时，不需要对数据进行掩码操作。

如果服务端接收到的数据没有进行过掩码操作，服务端需要断开连接。

如果Mask是1，那么在Masking-key中会定义一个掩码键（masking key），并用这个掩码键来对数据载荷进行反掩码。所有客户端发送到服务端的数据帧，Mask都是1。

掩码的算法、用途在下一小节讲解。

**Payload length**：数据载荷的长度，单位是字节。为7位，或7+16位，或1+64位。

假设数Payload length === x，如果

- x为0~126：数据的长度为x字节。
- x为126：后续2个字节代表一个16位的无符号整数，该无符号整数的值为数据的长度。
- x为127：后续8个字节代表一个64位的无符号整数（最高位为0），该无符号整数的值为数据的长度。

此外，如果payload length占用了多个字节的话，payload length的二进制表达采用网络序（big endian，重要的位在前）。

**Masking-key**：0或4字节（32位）

所有从客户端传送到服务端的数据帧，数据载荷都进行了掩码操作，Mask为1，且携带了4字节的Masking-key。如果Mask为0，则没有Masking-key。

备注：载荷数据的长度，不包括mask key的长度。

**Payload data**：(x+y) 字节

载荷数据：包括了扩展数据、应用数据。其中，扩展数据x字节，应用数据y字节。

扩展数据：如果没有协商使用扩展的话，扩展数据数据为0字节。所有的扩展都必须声明扩展数据的长度，或者可以如何计算出扩展数据的长度。此外，扩展如何使用必须在握手阶段就协商好。如果扩展数据存在，那么载荷数据长度必须将扩展数据的长度包含在内。

应用数据：任意的应用数据，在扩展数据之后（如果存在扩展数据），占据了数据帧剩余的位置。载荷数据长度 减去 扩展数据长度，就得到应用数据的长度。

**3、掩码算法**

掩码键（Masking-key）是由客户端挑选出来的32位的随机数。掩码操作不会影响数据载荷的长度。掩码、反掩码操作都采用如下算法：

首先，假设：

- original-octet-i：为原始数据的第i字节。
- transformed-octet-i：为转换后的数据的第i字节。
- j：为`i mod 4`的结果。
- masking-key-octet-j：为mask key第j字节。

算法描述为： original-octet-i 与 masking-key-octet-j 异或后，得到 transformed-octet-i。

> j = i MOD 4
> transformed-octet-i = original-octet-i XOR masking-key-octet-j

## **数据传递**

一旦WebSocket客户端、服务端建立连接后，后续的操作都是基于数据帧的传递。

WebSocket根据`opcode`来区分操作的类型。比如`0x8`表示断开连接，`0x0`-`0x2`表示数据交互。

**1、数据分片**

WebSocket的每条消息可能被切分成多个数据帧。当WebSocket的接收方收到一个数据帧时，会根据`FIN`的值来判断，是否已经收到消息的最后一个数据帧。

FIN=1表示当前数据帧为消息的最后一个数据帧，此时接收方已经收到完整的消息，可以对消息进行处理。FIN=0，则接收方还需要继续监听接收其余的数据帧。

此外，`opcode`在数据交换的场景下，表示的是数据的类型。`0x01`表示文本，`0x02`表示二进制。而`0x00`比较特殊，表示延续帧（continuation frame），顾名思义，就是完整消息对应的数据帧还没接收完。

**2、数据分片例子**

直接看例子更形象些。下面例子来自[MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)，可以很好地演示数据的分片。客户端向服务端两次发送消息，服务端收到消息后回应客户端，这里主要看客户端往服务端发送的消息。

**第一条消息**

FIN=1, 表示是当前消息的最后一个数据帧。服务端收到当前数据帧后，可以处理消息。opcode=0x1，表示客户端发送的是文本类型。

**第二条消息**

1. FIN=0，opcode=0x1，表示发送的是文本类型，且消息还没发送完成，还有后续的数据帧。
2. FIN=0，opcode=0x0，表示消息还没发送完成，还有后续的数据帧，当前的数据帧需要接在上一条数据帧之后。
3. FIN=1，opcode=0x0，表示消息已经发送完成，没有后续的数据帧，当前的数据帧需要接在上一条数据帧之后。服务端可以将关联的数据帧组装成完整的消息。

## 安全性

- WebSocket连接建立在TSL之上

- WebSocket没有同源策略（same-origin-policy）的限制, 在服务端进行origin验证，WS库也会自带验证选项

  ```js
  var WebSocketServer = require('ws').Server,
  	wss = new WebSocketServer({
  		port: 8181,
  		origin: 'http://mydomain.com',
  		verifyClient: function(info, callback) {
  			if(info.origin === 'http://mydomain.com') {
  				callback(true);
  				return;
  			}
  			callback(false);
  		}
  	}),
  //在这里如果验证不成功，WS库会回复一个401错误码
  ```

  尽管如此，这也不能避免在浏览器外运行的脚本传递正确的origin头部，但这可以避免CSRF攻击

- 防止clickjacking,

  - 使用framebusting，即用js代码判断当前frame是不是被嵌入其他frame

    ```html
    <script>
    if(self===top) {
    	documents.getElementsByTagName("body")[0].style.display = 'block';
        //把上面这段代码放到页面的head中，在加载时做预先判断。主要思路是，先把页面的body藏起来，判		断此时页面并没有被嵌套在一个iframe时，再把body显示出来。
    } else {
    	top.location = self.location;
        //直接重定向
    }
     //或者更直接一些
    if (top.location != location) {
    	top.location = self.location;
    }
    
    </script>
    
    ```

  - X-Frame-Options for Framebusting

    最安全的方法是在HTTP Response报文头部中加入X-Frame-Options选项控制，具体值如下：

    - DENY ： Prevents framing code at all
    - SAMEORIGIN ：SAMEORIGIN
    - ALLOW-FROM *uri*  Allows framing only by the specified site

- Denial of Service attck

  为了防止DOS攻击，可以使用如下方法：

  - 对来自同一个IP的连接数量进行限制
  - 对服务器而言，对于每个连接的请求都确保是异步的
  - 确保用户不能使服务器执行资源密集型任务

- Frame Masking

  WebSocket中的Frame Masking(数据掩码) 是为了安全而设置的，它并不是为了保护数据本身，因为算法本身是公开的，运算也不复杂，它是用来防止cache poisoning（**It's used to ensure that shitty proxies cannot be abused by attackers from the client side**. ）防止Websocket成为攻击媒介。

  对于客户端来说，浏览器会自动会websocket数据帧设置masking，没有被masked的数据帧是无效的。Messages from the client must be masked, so your server should expect this to be 1. (In fact, [section 5.1 of the spec](http://tools.ietf.org/html/rfc6455#section-5.1) says that your server must disconnect from a client if that client sends an unmasked message.) When sending a frame back to the client, do not mask it and do not set the mask bit 

  Data masking ensures that cache poisoning is less likely to happen due to variability in the data packet

- 客户端验证

  由于浏览器对基于WebScoket的连接有限制，在WebSocket握手过程中没有传递自定义头部的可能，所以完成验证大多使用简单的header(随机的token)或者基于表单和set-cookie



