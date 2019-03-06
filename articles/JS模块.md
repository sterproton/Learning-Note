# JS模块

什么是模块？模块是一段可重用的代码，它封装了实现细节并公开了一个公共API，以便其他代码可以轻松加载和使用它。函数就是最小的模块

我们使用模块的原因有以下几个：

- 抽象代码：将功能委托给专门的库，所以我们不需要了解它们的实现和复杂性。
- 封装代码：当我们不想暴露代码、不想代码被修改，想简化代码逻辑时，我们可以使用模块封装代码
- 复用代码：提取代码重复逻辑，复用它
- 依赖管理：避免修改代码时轻松管理依赖

## js模块历史

IIFE（立即执行函数）

```js
(function(){})()
(function(){}())

const lib = (function(){
    function someAPI(){}
    return {someAPI,}
})()
```



IIFE可以避免污染全局变量、提供作用域、封装代码避免受到其他代码影响，提供命名空间

无法解决依赖管理的问题

### Revealing module pattern

```js
// Expose module as global variable
var singleton = function(){

  // Inner logic
  function sayHello(){
console.log('Hello');
  }

  // Expose API
  return {
   sayHello: sayHello
  }
}()
```

同上好处，同样无法解决依赖管理



## 模块规范

模块规范是定义模块的语法

- Asynchronous Module Definition (AMD)

  使用在浏览器，异步加载，使用define定义模块

  ```javascript
  //Calling define with a dependency array and a factory function
  define(['dep1', 'dep2'], function (dep1, dep2) {
  
      //Define the module value by returning a value.
      return function () {};
  });
  ```

- CommonJS

   CommonJS规范用在Node，使用require加载模块，module.exports导出模块 (exports是module.exports引用的复制，真正导出的是module.exports，给exports赋值不会改变module.exports)

  ```js
  var dep1 = require('./dep1');  
  var dep2 = require('./dep2');
  
  module.exports = function(){  
    // ...
  }
  ```

- Universal Module Definition (UMD)

  UMD规范可以使用在浏览器和Node

- System.register

   [System.register 规范](https://github.com/ModuleLoader/es-module-loader/blob/master/docs/system-register.md) 被设计来在es5中实现es6模块语法

- ES6模块规范

## 模块加载器

模块加载器解释和执行用特定规范写好的模块，它在运行时执行

- 浏览器加载执行模块加载器
- 浏览器加载主文件
- 模块加载器下载需要的文件

Require.js  AMD规范

SystemJS  AMD、CommonJS、UMD、System.register规范

## 模块打包器（Module bundler）

打包器在构建时执行，将需要的模块打包成bundle

- Browserify
- Webpack

- rollup
- parcel