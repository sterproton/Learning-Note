# JS 值类型以及转换

### 判断值的类型

- typeof，能判断基本值类型（对于null会判断为object）、function

- instanceof，用于测试构造函数的prototype属性是否存在于现在对象的原型链的位置，可用来判断对象具体是什么对象

  **instanceof 判断多个frame或者多个window的全局对象时会引发问题** 因为 `[] instanceof window.frames[0].Array` `返回false。可以用Array.isArray 或者 Object.prototype.toString.call(obj)来进行具体的判断

> 对于typeof Undeclared的行为可以用来判断变量而不用担心报错
>
> if(undeclare) 会导致报错
>
> typeof isdeclare !== "undefined"即可安全地判断变量是否存在
>
> 又或者 window.isdeclare

### 值的类型

值有类型，分为基本值类型（primitive type）、复杂类型（Object type），除Object以外的类型都是不可变的（immutable）。

> A primitive value is a member of one of the following built‑in types: Undefined, Null, Boolean, Number, String, and Symbol; an object is a member of the built‑in type Object; and a function is a callable object. A function that is associated with an object via a property is called a method.
>
> 摘自 Ecma 262

---

**基本值类型** 有如下

- 布尔类型（The Boolean Type）：值有 true、false
- Null类型 （The Null Type）：值有null
- Undefined类型 （The Undefined Type）：值有 undefined
- 数字类型：值为基于 IEEE 754 标准的双精度 64 位二进制格式的值（-(263 -1) 到 263 -1）**它并没有为整数给出一种特定的类型**。除了能够表示浮点数外，还有一些带符号的值：`+Infinity`，`-Infinity` 和 `NaN` (非数值，Not-a-Number)。
- 字符串类型：用于表示文本数据。它是一组16位的无符号整数值的“元素”
- 符号类型：符号类型是唯一的并且是不可修改的, 并且也可以用来作为Object的key的值



---

**复杂值类型** 为Object类型：是一组属性的集合，每个属性（property）都有特性（attribute）来决定属性如何被使用。属性包含着其他对象（objects）、基本值、或者函数

对象是通过字面量或者 通过构造函数生成的。每一个构造函数拥有 一个prototype属性来实现“基于原型的继承和共享属性机制”。 对象通过在new语句中使用构造函数被创建。不使用new语句调用一个构造函数得到的结果取决于构造函数。例如`new Date(2009,11)`生成一个日期对象而Date()产生一个表示当前时间的的字符串



---

原型链机制：

每个被构造函数创造的对象有一个对其构造函数prototype属性的值的隐式引用，并且，一个prototype可能有一个不为null的对其prototype的隐式引用，因此即是所谓的原型链（prototype chain）。原型链机制如下When a reference is made to a property in an object, that reference is to the property of that name in the first object in the prototype chain that contains a property of that name. In other words, first the object mentioned directly is examined for such a property; if that object contains the named property, that is the property to which the reference refers; if that object does not contain the named property, the prototype for that object is examined next; and so on.

对象可分为：

- 普通对象（ordinary object）
- 外来对象 （exotic object）
- 标准对象 （standard object）
- 内建对象 （built‑in object）



---

对象是一些属性的集合，属性只能是数据属性或者访问器属性（either a data property, or an accessor property）其一

- 数据属性：A data property associates a key value with an ECMAScript language value and a set of Boolean attributes
- 访问器属性：An accessor property associates a key value with one or two accessor functions, and a set of Boolean attributes. The
  accessor functions are used to store or retrieve an ECMAScript language value that is associated with the property.



**数据属性的特性(Attributes of a data property)**

| 特性             | 数据类型           | 描述                                                         | 默认值    |
| ---------------- | ------------------ | ------------------------------------------------------------ | --------- |
| [[Value]]        | 任何Javascript类型 | 包含这个属性的数据值。                                       | undefined |
| [[Writable]]     | Boolean            | 如果该值为 `false，`则该属性的 [[Value]] 特性 不能被改变。   | true      |
| [[Enumerable]]   | Boolean            | 如果该值为 `true，`则该属性可以用 [for...in](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in) 循环来枚举。 | true      |
| [[Configurable]] | Boolean            | 如果该值为 `false，`则该属性不能被删除，并且 除了 [[Value]] 和 [[Writable]] 以外的特性都不能被改变。 | true      |



**访问器属性**

访问器属性有一个或两个访问器函数 (get 和 set) 来存取数值，并且有以下特性:

| 特性             | 类型                   | 描述                                                         | 默认值    |
| ---------------- | ---------------------- | ------------------------------------------------------------ | --------- |
| [[Get]]          | 函数对象或者 undefined | 该函数使用一个空的参数列表，能够在有权访问的情况下读取属性值。另见 `get。` | undefined |
| [[Set]]          | 函数对象或者 undefined | 该函数有一个参数，用来写入属性值，另见 `set。`               | undefined |
| [[Enumerable]]   | Boolean                | 如果该值为 `true，则该属性可以用` [for...in](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in) 循环来枚举。 | true      |
| [[Configurable]] | Boolean                | 如果该值为 `false，则该属性不能被删除，并且不能被转变成一个数据属性。` | true      |



### 特殊的值

undefined 和 null 常被用来表示“空的”值或“不是值”的值。二者之间有一些细微的差别

- null指空值
- undefined指没有值

或者

- undefined指未赋值
- null曾赋过值，目前没有值

null 是一个特殊关键字，不是标识符，我们不能将其当作变量来使用和赋值。然而 undefined 却是一个标识符，可以被当作变量来使用和赋值。

检测NaN使用 Number.isNaN



### 判断值相等

使用Object.is()来判断两个值是否绝对相等，=== 会将 +0 和 -0 判断为相等

### Call By Sharing

什么是call by sharing？ 在JS中所有的变量都refer to 值，所以当我们传递变量进入函数时，参数是一个值，这个值本身也可以是一个reference，或者基本值，这就是所谓的 call by sharing。

当我们传递变量进入函数时，新的变量在函数的作用域被生成，它 refers to 传进来的值。在JS中， 对象是mutable的，而基本值时immutable的，所以在函数的作用域中对对象属性的修改对于调用函数的作用域来说是可见的，因为这是共享的reference。

```js
function fn(a, b) {
  a.prop = 'changed value';
  b[3] = 10;
}
var obj1 = {'prop': 'value'};
var arr = [1, 2, 3, 4, 5]
fn(obj1, arr);
console.log(obj1, arr);
// 输出
{'prop': 'changed value'}, [1, 2, 3, 10, 5]
```

**对变量的重新赋值意味着这个变量refer to不同的值，所以调用者作用域的变量与函数内部变量refer to不同的值，所以外部的变量不会被影响到**

**但是对于call by reference 来说，对变量的重赋值不是refer to 别的reference，而是改变reference本身，比如说被指针指向的**



