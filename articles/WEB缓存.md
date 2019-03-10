# 浏览器缓存

分类

- 私有缓存
- 代理缓存： ISP

----

缓存控制

- 禁止缓存：cache-control：no-store

- 强制确认缓存：cache-control：must-revalidate

  每次有请求发出，缓存会将请求发送至服务器（请求带有验证字段）服务器验证缓存是否过期，未过期（304）才使用本地缓存

- 私有缓存/共有缓存

  默认private，如果为public就可以被中间人缓存

- 过期机制

  expires: **Expires** 响应头包含日期/时间， 即在此时候之后，响应过期。由服务器决定，如果客户端与服务器时间不同步将导致缓存失效。如果与max-age同时用，忽略expires

  max-age:距离请求发起时间的秒数，表示资源保持新鲜的最大时间

----

新鲜度

如果缓存过期，客户端发起请求，缓存会将请求附上if-none-match header发送给服务器，如服务器检查资源还是新鲜，则返回304，否则返回新的版本

If-Modified-Since与**If-None-Match**区别

- If-None-Match

  `If-None-Match: <etag_value>`

  采用get或者head来更新拥有特定etag属性值的缓存实体，如果与If-Modified-Since同时出现，则If-None-Match 优先级更高

- If-Modified-Since

  `If-Modified-Since: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT`

  针对时间用来更新没有etag的缓存实体

----

缓存校验

用户刷新按钮时会开始缓存验证。

如果带http响应头里带Cache-control: must-revalidate，在浏览过程中也会触发

当缓存的文档过期后，需要进行缓存验证或者重新获取资源。只有在服务器返回强校验器或者弱校验器时才会进行验证。

#### Etags

Etags对浏览器是不透明的，是资源特定版本的标识符，通常使用内容的哈希，或最后修改时间的哈希，如果内容没有改变就不发送完整响应，如果改变，可以避免空中碰撞

~~~
ETag: W/"<etag_value>" //弱验证器
ETag: "<etag_value>"
~~~

分为强验证器以及弱验证器，弱验证器很容易生成，但不利于比较。 强验证器是比较的理想选择，但很难有效地生成。强验证类型的作用在于确保要比较的资源与其相比较的对象之间每一个字节都相同，弱验证的话，如果页面页脚时间不同就会被认为是相同的

防止空中碰撞

> 如果在wiki上修改文章内容，post请求会带上 If-Match头部附上etags去检查资源是否最新（修改文章时有没有被其他人同时修改过），如果匹配则可以陈宫修改，如果不匹配，就代表已经被修改过，放回412前置条件错误



no-cache与no-store的区别

no-cache：浏览器会缓存资源文件，然而每次请求都要向服务器发起验证请求以确保资源不会过期

no-store：不允许缓存

根据cache-control头部判断有无缓存策略

强缓存：根据max-age或者**Expires**判断是否命中强缓存，如果没有命中就发送验证请求

协商缓存：当没有命中强缓存，则根据修改时间或者etags判断是否命中。

----

实际应用

考虑缓存的内容：

- css样式文件
- js文件
- logo、图标
- html文件：可以no-cache、或者选择 ETag 或 Last-Modified 来做验证
- 可以下载的内容

一些不应该被缓存的内容：

- 业务敏感的 GET 请求

对于不长改变的文件可以设置一个较大的max-age值，因为如果打包出来的文件内容改变了，构建工具可以通过哈希改变文件名，相当于请求新的文件。

#### pragma

除了可以使用上面提到的这些首部来控制缓存之外，另外还有一个古老的响应首部就是 `Pragma`。Pragma 首部的值只有一个可选值就是 `no-cache` ，含义和 Cache-Control: no-cache 是一样的。但是 Pragma 优先级要高于 Cache-Control，而Cache-Control则又比Expires首部具有更高的优先级。

服务器端定制最佳Cache-Control策略

![img](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/images/http-cache-decision-tree.png?hl=zh-cn)





客户端缓存与快速更新可以通过在文件名嵌入文件指纹或者版本号同时获得

对于JS文件，通过模块的划分也可以将开发库、框架的设定长时间的缓存。

![缓存层次结构](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/images/http-cache-hierarchy.png?hl=zh-cn)





