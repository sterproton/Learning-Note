# 关于HTTP协议中的轮询与keep-alive

**Connection ** 首部（header）决定当前事务(transaction)完成后是否会关闭网络连接，如果该值是“keep-alive”，网络连接就是持久的，不会关闭，使得对同一个服务器的请求可以继续在该连接上完成。

- Connection: keep-alive
- Connection: close


close : 表明客户端或服务器想要关闭该网络连接，这是HTTP/1.0请求的默认值

keep-alive : 表明客户端想要保持该网络连接打开，HTTP/1.1的请求默认使用一个持久连接 

注意：HTTP Connection首部的Keep-Alive字段与TCP 中的keepalive没有任何关系

> HTTP Keep-Alive is a feature of HTTP protocol. The web-server, implementing Keep-Alive Feature, has to check the connection/socket periodically (for incoming HTTP request) for the time span since it sent the last HTTP response (in case there was corresponding HTTP Request). If no HTTP request is received by the time of the configured keep-alive time (seconds) the web server closes the connection. No further HTTP request will be possible after the 'close' done by Web Server. On the other hand, TCP Keep-Alive is managed by OS in the TCP layer. HTTP Keep-Alive and TCP Keep-Alive is totally unrelated things.
>
>  by [Ayub](https://stackoverflow.com/users/978215/ayub)

keep-alive是http1.0与http1.1的特性之一，意在提供长效的HTTP会话，以避免客户端频繁建立tcp连接的消耗。

想象一个这样的场景：一个客户端通过页面向服务器发送request，之后两者建立一个tcp连接，伴随着返回响应信息，服务器同时将连接关闭。这个过程分为四个步骤：

1. 建立tcp连接
2. 发出请求文档
3. 发出响应文档
4. 释放tcp连接

![img](http://51write.github.io/images/2014/http-tcp.jpg)

如果此时请求的页面中含有其他的连接，比如图片、js等，客户端将重复这个过程。keep-alive的作用在于第一次建立连接时，服务器器将保持这个tcp连接一段时间(不超过设定的KeepAliveTimeout)，以节省重复过程1和4创建tcp连接与释放tcp连接的时间。

**HTTP1.0 Keep-Alive的数据交互流程:**

1. 建立tcp连接
2. Client 发出request，并声明HTTP版本为1.0，且包含header:"Connection： keep-alive"。
3. Server收到request，通过HTTP版本1.0和"Connection： keep-alive"，判断连接为长连接；故Server在response的header中也增加"Connection： keep-alive"。
4. 同时，Server不释放tcp连接，在Client收到response后，认定为长连接，同样也不释放tcp连接。这样就实现了会话的保持。
5. 直到会话保持的时间超过keepaliveTime时，client和server端将主动释放tcp连接。

**HTTP1.1 Keep-Alive的数据交互流程:**

1. 建立tcp连接
2. Client 发出request，并声明HTTP版本为1.1。
3. Server收到request后，通过HTTP版本1.1就认定连接为长连接；此时Server在response的header中增加"Connection： keep-alive"。
4. Server不释放tcp连接，在Client收到response后，通过"Connection： keep-alive"判断连接为长连接，同样也不释放tcp连接。
5. 这个过程与http1.0类似，仅是http1.1时，客户端的request不用声明"Connection： keep-alive"。

大多数时候，是否能保存长连接以及设定长连接的时间，并不由服务器决定，有时浏览器(比如火狐等)，其默认60秒后自动断开任何长连接。这时服务器的tomeout时间将失效。

**注意上述连接是TCP连接**

## 误解？探究

可能有人认为HTTP连接分为长连接和短连接，其实**HTTP协议是基于请求/响应模式的，只要服务端给了响应，本次HTTP事务(transaction)就结束了**，之所以网络上说HTTP分为长连接和短连接，其实本质上是说的TCP连接。**TCP连接是一个双向的通道，它是可以保持一段时间不关闭的，因此TCP连接才有真正的长连接和短连接这一说**。其实知道了以后，会觉得这很好理解。HTTP协议是应用层的协议，而TCP才是真正的传输层协议，只有负责传输的这一层才需要建立连接。

> HTTP 是个应用层协议。HTTP 无需操心网络通信的具体细节；它把联网的细节都交给了通用、可靠的因特网传输协议 TCP/IP。
>
> by  <HTTP: The Definitive Guide>

小总结：现在我们基本都使用HTTP1.1协议，基本上Connection都是keep-alive，默认使用TCP长连接，如果在超过设定的时间没有HTTP请求，client和server端将主动释放tcp连接。，否则TCP连接将会越来越多

## 轮询

- **短轮询**

  短轮询指的是客户端按照一定循环周期不断发起请求，服务器对于每一次请求都立即返回结果，客户端再根据新旧数据对比决定是否使用这个结果。

- **长轮询**
  而长轮询及是在请求的过程中，若是服务器端数据并没有更新，那么则将这个连接挂起，直到服务器推送新的数据，再返回，然后再进入下一轮循环

对于客户端来说，不管是长轮询还是短轮询，客户端的动作都是一样的，就是不停的去请求，不同的是服务端，短轮询情况下服务端每次请求不管有没有变化都会立即返回结果，而长轮询情况下，服务器保持连接知道有了新数据才发送 HTTP/S响应，完成一直开启的HTTP请求。客户端收到响应后再进入下一轮循环

长短轮询的理想实现都应当基于长连接，否则若是循环周期太短，那么服务器的荷载会相当重；当然，即便是在长连接下，访问人数过多，长短轮询都有可能造成服务器的瞬时访问量庞大，这就需要一些相应的优化实践了。