# JS动画优化

当我们在某个元素上执行动画时，浏览器需要每一帧都检测是否有元素受到影响，并调整他们的大小，位置，通常这种调整都是联动的，我们称为reflow。同样的，浏览器还需要监听元素的外观变化，通常是背景色，阴影，边框等可视元素，并进行重绘，我们称为repaint。每次reflow，repaint后浏览器还需要合并渲染层并输出到屏幕上。所有的这些都会是动画卡顿的原因。

> Reflow 的成本比 Repaint 的成本高得多的多。一个结点的 Reflow 很有可能导致子结点，甚至父点以及同级结点的 Reflow 。在一些高性能的电脑上也许还没什么，但是如果 Reflow 发生在手机上，那么这个过程是延慢加载和耗电的。
> ——浏览器的渲染原理简介

一个页面上来，浏览器会经过一番处理，生成相应的位图。然后把它们扔给GPU。GPU再拼接位图，合并渲染层，并把最终结果输出到屏幕

## 渲染层/堆叠上下文

- 当一个元素位于HTML文档的最外层（元素）
- 当一个元素position不为initial，并且拥有一个z-index值（不为auto）
- 当一个元素被设置了opacity，transforms, filters, css-regions, paged media等属性。
- （当然还会有其他情况）

那么就会产生一个新的渲染层（堆叠上下文），这时候执行动画，只需要GPU按照现有的位图，按照相应的变换在独立的渲染层中输出，然后再合并输出。这个过程并不需要主线程CPU的参与。

而当我们使用left,padding,margin,JavaScript,jQuery等方式来执行动画，那么流程就不一样了。

还是举上面的例子，CPU需要重新计算每一帧，元素的位置，外观，重新定位元素，repaint，然后才生成位图，传给GPU渲染。

所以当我们开启GPU渲染的时候，浏览器主线程就能空出来去响应用户输入了。

## 动画优化要点

- 执行动画尽量使用CSS3 keyframes和 trainsition
- 如果需要JS执行动画，使用requestAnimationFrame,或者Velocity,避免使用jQuery动画,setTimeout,setInterval。
- js动画的优点是，我们能随时控制开始，暂停，停止，而CSS不行。缺点是没办法像css这样优化，因为js动画是在主线程上跑的。
- 动画尽量使用transform,opacity，尽量避免left/padding/background-position等
- 尽量避免不必要的动画发生[点击这里](http://www.html5rocks.com/en/tutorials/speed/unnecessary-paints/)
- 尽可能的为产生动画的元素使用fixed或absolute的position
- 阴影渐显动画尽量用伪类的opacity来实现。[点击这里](http://www.w3ctrain.com/2015/11/25/how-to-animate-box-shadow/)
- 使用3D硬件加速提升动画性能时，最好给元素增加一个z-index属性，人为干扰复合层的排序，可以有效减少chrome创建不必要的复合层，提升渲染性能，移动端优化效果尤为明显。(来自[前端农民工](http://div.io/topic/1348))
- 使用Chrome Timeline工具检查
- 时刻把浏览器处理流程记在心里