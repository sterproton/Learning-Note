## 客户端识别

HTTP事务是无状态的，而在WEB开发当中,希望用户与站点交互过程构建增量状态，所以就需要区分不同用户的HTTP事务

- 承载用户信息的HTTP首部：基本不用，不足以实现可靠识别
- 客户端IP追踪
  - 无法区分共用一台机器的多个用户
  - 动态IP分配使得服务器无法假设IP地址在各登录会话中识别用户
  - 代理
- 用户登录，用认证的方式识别
- 胖URL
- cookie

### 用户登录、认证

基本认证

- 用户对站点发起请求
- 服务器返回401 loginrequired响应码，并添加www-Authentication首部，此时浏览器会弹出登录对话框
- 用户输入用户名以及密码，浏览器重复原来请求，这次会添加Authorization首部，并对用户名以及密码进行加密
- 今后的请求要使用用户名和密码时，浏览器会自动将存储下来的值发送出去，甚至在站点没有要求发送的时候也经常会向其发送。浏览器在每次请求中都向服务器发送Authorization 首部作为一种身份的标识，这样，只要登录一次，就可以在整个会话期间维持用户的身份了。

#### 胖URL

可以通过胖url将WEB服务器上若干个独立的http协议捆绑成一个会话，用户首次访问这个Web 站点时，会生成一个唯一的ID，用服务器可以识别的方式将这个ID 添加到URL 中去，然后服务器就会将客户端重新导向这个胖
URL。不论什么时候，只要服务器收到了对胖URL 的请求，就可以去查找与那个用户ID 相关的所有增量状态

缺点：

- 无法共享url
- 破坏缓存
- 非持久
- 逃逸口

### cookie

cookie 是当前识别用户，实现持久会话的最好方式。

会话cookie 和持久cookie 之间唯一的区别就是它们的过期时间

cookie通过Set-Cookie的头部，通过服务器的响应设置的

#### cookie0

- domain

  cookie的域，用来控制哪些站点可以访问到cookie。

- allh

- path

  可选，通过这个属性可以为服务器上特定文档分配cookie

- secure

  是否在只有SSL/TSL连接时才发送cookie

- expiration

  过期时间

- name

- value

#### cookie1

- 使用相对秒数而不是绝对日期来控制cookie存活（max-age）

- 通过URL端口号而不仅仅是域和路径控制cookie（port）
- 关联上解释性文本（comment）
- 允许浏览器推出后不考虑时间直接销毁cookie（discard）

~~~http
Set-Cookie2: foo="bar"; Version="1"; 
Port="80,81,8080"
Set-Cookie2: foo="bar"; Version="1"; Port
~~~



### cookie的性质

一个页面可以为本域和任何父域设置cookie

### cookie 的设置

顶级域名只能设置cookie的domain为顶级域名，顶级域名的cookie可以共享给子域名

#### cookie与缓存

缓存与带cookie的的文档需要小心，不能将其他用户的cookie分配给用户，所以

- 如果无法缓存文档则需要标记，cache-control：no-store



### 通用HTTP认证框架

基本身份验证

![img](https://mdn.mozillademos.org/files/14689/HTTPAuth.png)



流程如下：

- 客户端向服务器请求敏感内容
- 服务器在响应中的www-authenticate首部加入进行验证的信息，返回错误码401
- 客户端请求加上包含恰当内容的Authrization首部

上述流程需要通过HTTPS连接保证安全

**HTTP认证的字符编码是utf-8**  

-----

代理认证

与上述同样的询问质疑和响应原理使用于代理认证。资源认证和代理认证可以并存，区别于独立的头信息和响应状态码。代理认证，询问质疑的状态码是 [`407`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/407)（必须提供代理证书），响应头[`Proxy-Authenticate`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Proxy-Authenticate)至少包含一个可用的质制，并且请求头[`Proxy-Authorization`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Proxy-Authorization)用作提供证书给代理服务器。

当代理服务器受到合法认证信息，但是该认证不能获取请求资源的权限时，代理服务器会返回403状态码

WWW-Authenticate 与 Proxy-Authenticate 首部

~~~http
WWW-Authenticate: <type> realm=<realm>
Proxy-Authenticate: <type> realm=<realm>
~~~

<type> 指的是验证的方案，realm形容的是保护区域

Authorization与Proxy-Authorization首部

Authorization与Proxy-Authorization请求消息首部包含有用来向（代理）服务器证明用户代理身份的凭证。这里同样需要指明验证的类型，其后跟有凭证信息，该凭证信息可以被编码或者加密，取决于采用的是哪种验证方案。

```
Authorization: <type> <credentials>
Proxy-Authorization: <type> <credentials>
```

type同样是验证方案，其后跟着凭证信息

验证方案有

- Basic  base64b编码凭证
- Beare ：(查看 [RFC 6750](https://tools.ietf.org/html/rfc6750), bearer 令牌通过OAuth 2.0保护资源),
- Digest ：(查看 [RFC 7616](https://tools.ietf.org/html/rfc7616), 只有 md5 散列 在Firefox中支持, 查看 [bug 472823](https://bugzilla.mozilla.org/show_bug.cgi?id=472823) 用于SHA加密支持),
- HOBA ： **H**TTP **O**rigin-**B**ound 认证, 基于数字签名
- Mutual
- **AWS4-HMAC-SHA256**

由于用户 ID 与密码是是以明文的形式在网络中进行传输的（尽管采用了 base64 编码，但是 base64 算法是可逆的），所以基本验证方案并不安全。基本验证方案应与 HTTPS / TLS 协议搭配使用。假如没有这些安全方面的增强，那么基本验证方案不应该被来用保护敏感或者极具价值的信息。



### 摘要认证

握手机制