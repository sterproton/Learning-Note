# Web性能优化

## 资源加载

## JavaScript

资源大小
- 用Minify插件去除冗余代码、空格等
- 通过路由实现代码分割、动态导入模块
- 使用打包工具移除冗余的代码依赖、移除未使用的模块

加载

- 使用defer 或者将script标签放在body底部避免阻塞HTML文件解析

## CSS

- 使用post-css、CSS-NANO去除冗余代码
- 使用Purify插件去除无用代码
- 将CSS代码分割为关键代码和非关键代码，同时也可以减少CSS文件加载对HTML文档解析的阻塞

### 图片

- 选择合适的图片格式

  - 图标、LOGO可以使用SVG、png
  - 普通图片可以使用JPG
  - 大型GIF可以转换成视频文件

- CSS雪碧图：使用于图标logo等

- 图片压缩: 

  - SVG：SVG是文本，可以使用工具压缩，比如删除空格注释，简化SVG路径

  - JPG: 

    - 压缩像素大小（如果将高像素图片放入小容器，浏览器会耗费更多时间下载并且降低像素）

    - 通过打包工具压缩图片质量至70-80
    - 使用JPEG，它可以在加载过程中渐进地渲染图片，从低质量到高质量 （image-webpack-loader）

  - png

    - *Interlaced PNG.*
    - *Use indexed colors*

总的来说，就是选择合适图片格式、合适的像素、压缩图片质量、使用渐进渲染的图片



### 字体

- 添加fallback字体

## 工具

- chrome light house
- [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer).

## 网络优化

- 预加载资源
- 利用好浏览器的缓存机制
- 压缩HTTP响应实体主体，比如Gzip、Brotli

- 托管静态文件在CDN，比如图片、视频、字体、HTML、JS、CSS文件

- 使用负载均衡系统
