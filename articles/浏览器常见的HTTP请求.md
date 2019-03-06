

# 浏览器常见HTTP请求

## GET

GET请求时浏览器最常用的HTTP请求，用来获取HTML、JS、CSS、IMG、字体格式文件（WOFF2、WOFF、EOT、TTF）视频文件（video/webm）JSON文件 升级WebSocket等等等等。

GET可以通过路径(path)、查询字符串(QueryString)来让服务器知道如何响应，GET只能通过查询字符串向服务器发送信息，在浏览器的实现中，GET请求的body都是空的，如果你用XHR或者Fetch在GET请求的Body设置了body的话，XHR不会报错但会在发送请求前会将BODY清空，Fetch则会报错。虽然RFC对于GET的body里面放payload有如下说法，但是浏览器的实现是不允许GET请求的body带数据。当然，如果是自己写的应用程序，使用HTTP协议让GET的的BODY带数据也是可以的，语法符合但是不太符合语义（GET应该只被当作获取信息用的）

> ```
> A payload within a GET request message has no defined semantics;
> sending a payload body on a GET request might cause some existing
> implementations to reject the request
> from rfc7231
> ```

## POST

POST 常见提交数据的格式或者方式

- text/plain

- application/x-www-form-urlencoded

  Content-type被设定为如上，提交的数据按照key1=val1&key2=val2的方式进行编码，其中key和val都进行了URL转码，这是提交表单时，浏览器发送表单字段的做法

---

Percent-encoding

又称为url-encoding，是一种在某种情况下将信息编码成URI的一种编码机制，it is also used in the preparation of data of the `application/x-www-form-urlencoded` [media type](https://en.wikipedia.org/wiki/Media_type)，as is often used in the submission of [HTML](https://en.wikipedia.org/wiki/HTML) [form](https://en.wikipedia.org/wiki/Form_(web)) data in [HTTP](https://en.wikipedia.org/wiki/HTTP) requests.

URI中的字符串分为保留字符与非保留的，如果一个URI中出现保留字符，则需要进行转义

``!``*``'``(``)``;``:``@``&``=``+``$``,``/``?``#``[``]

Percent-encoding一个保留字符，即是将它的对应的ASCII byte value转换成一个以%（用来当做转义符号）为开头的16进制数字对（a pair of [hexadecimal](https://en.wikipedia.org/wiki/Hexadecimal)digits），转换后得到的结果取代原来URI中的保留字符。

**对于非ASCII字符，通常获取其对应UTF-8编码的byte sequence，然后以上述方式处理其中byte value** 

escape，encodeURI,encodeURIComponent区别

escape在对于非ASCII字符的处理是非标准的，废弃函数

encodeURI,encodeURIComponent区别在于前者设计对整个URL进行URL转义，故对于URL中的功能字符，比如&, ?, /, =等等这些并不会被转义，它应该接受 URI 的 protocol, host, port 等部分，只对 path 和 query 进行编码。而encodeURIComponent 会把这些功能字符也进行转义，其应用场景是手工拼URL的时候，对每对KV用encodeURIComponent进行转义。encodeURIComponent 应该用来编码查询字符串

---

- multipart/form-data
  使用表单上传文件时，必须让enctype 等于 multipart/form-data生成 boundary分割不同字段

  在使用XHR或者FETCH时可以使用FormData这个WEB API, 适用于传送文件、二进制与字符串数据混杂的数据

  ~~~js
  var formData = new FormData();
  formData.append('username', 'johndoe');
  formData.append('id', 123456);
  formData.append('file',file1)
  xhr.send(formData)
  ~~~

- application/json

  适合传送序列化数据，个人感觉其实直接传JSON字符串也可以，没必要设置这个Header。

## GET和POST的区别

首先，语法是相同的，语义是不同的（即浏览器的实现以及对其的处理的区别，比如浏览器不允许GET的BODY带数据）

>  GET后退按钮/刷新无害，POST数据会被重新提交（浏览器应该告知用户数据会被重新提交）。
>  GET书签可收藏，POST为书签不可收藏。
>  GET能被缓存，POST不能缓存 (在某种情况下可以缓存)
>  GET编码类型application/x-www-form-url，POST编码类型encodedapplication/x-www-form-urlencoded 或 multipart/form-data。为二进制数据使用多重编码。
>  GET历史参数保留在浏览器历史中。POST参数不会保存在浏览器历史中。
>  GET对数据长度有限制，当发送数据时，GET 方法向 URL 添加数据；URL 的长度是受限制的（URL 的最大长度是 2048 个字符）。POST无限制。
>  GET只允许 ASCII 字符。POST没有限制。也允许二进制数据。
>  与 POST 相比，GET 的安全性较差，因为所发送的数据是 URL 的一部分。在发送密码或其他敏感信息时绝不要使用 GET ！POST 比 GET 更安全，因为参数不会被保存在浏览器历史或 web 服务器日志中。
>  GET的数据在 URL 中对所有人都是可见的。POST的数据不会显示在 URL 中。

以上都是比较trival的区别，需要注意的是HTTP 请求的url长度限制是取决与浏览器和服务器的，HTTP协议并没有限制url的长度，414 Request-URI Too Long状态码可以在当URL的长度超过服务器设定值时发送

请求字节数也是浏览器实现导致的

重要的区别在于

- 安全性：基于浏览器与服务器对GETPOST处理，比如GET URL出现在地址栏，POST不会以及数据的记录问题

- 对服务器状态的影响：GET, HEAD, OPTIONS 和 TRACE 这几个方法是安全的。从语义来讲，它们不应该给服务器带来变化。POST会给服务器带来状态变化

- 幂等性(Idempotent )：GET是幂等的，POST不是幂等的，幂等即指同一个请求执行多次与执行一次效果一样

  引入幂等是为了处理同一个请求多次发送的问题，如果方法是幂等的，重复发送无问题，如果时POST这种不幂等的方法，重复发送会导致问题，这也是当刷新时浏览器会给提示的原因

- 可缓存性(cacheable): 可缓存性 顾名思义就是一个方法是否可以被缓存，RFC里GET，HEAD和某些情况下的POST都是可缓存的，但是绝大多数的浏览器的实现里仅仅支持GET和HEAD。



## PUT

幂等，语义为client对一个URI发送一个Entity，服务器在这个URI下如果已经又了一个Entity，那么此刻服务器应该替换成client重新提交的，也由此保证了PUT的幂等性。如果服务器之前没有Entity ，那么服务器就应该将client提交的放在这个URI上。

## DELETE

向服务器请求删除资源

> ```
>  The DELETE method requests that the origin server remove the
>   association between the target resource and its current
>    functionality.
> ```

## HEAD

跟GET基本相同，除了服务器响应少了报文的entity body，通常用于检测连接资源能否访问、有没有被修改

## OPTIONS

用于请求关于目标资源能否访问的选项的信息，在跨域通信时会用到，CORS中叫preflight请求