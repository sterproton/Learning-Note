## Action

定义：**Action** 是把数据从应用（这里之所以不叫 view 是因为这些数据有可能是服务器响应，用户输入或其它非 view 的数据 ）传到 store 的有效载荷。它是 store 数据的**唯一**来源。一般来说你会通过 [`store.dispatch()`](http://cn.redux.js.org/docs/api/Store.html#dispatch) 将 action 传到 store。

```js
const ADD_TODO = 'ADD_TODO'
{
  type: ADD_TODO,
  text: 'Build my first Redux app'
}//添加todo任务的action
```



带有type属性的JS对象就是我们在Redux中定义的action动作，在形式上，action就是带有type属性的js对象。在Redux的约定中，我们要将所有改变应用状态的操作规范为一个个action，在action中，我们也可以附上要用来修改应用状态state的数据：

```js
{ type: 'ADD_TODO', text: 'Use Redux' }
{ type: 'REMOVE_TODO', id: 42 }
{ type: 'LOAD_ARTICLE', response: { ... } }
```

目前为止，action有两个作用:

- 定义我们的应用可以进行的动作或操作的类型
- 传递改变应用状态的数据

根据Flux标准，action必须是JS对象，必须包含type属性，可以有payload/error/meta几个属性，除此之外不允许有任何其他属性。

```js
function addNumber(num) {
    return { type: 'INCREMENT', num }
}
function minusNumber(num) {
    return { type: 'DECREMENT', num }
}
////action creator

increment = () => {
    this.dispatch(addNumber(1));
  };
decrement = () => {
    this.dispatch(minusNumber(-1));
  };
/////
const counterActionGenerator = (type, num) => (num) => {
    let action = { type, num : num }
    return action
}
const addNumber = counterActionGenerator('INCREMENT', null)
const minusNumber = counterActionGenerator('DECREMENT', null)
///action creator generator
```



为了减少hardcode，可以使用action creator来创建action，也可以从action creator中抽象出action creator的generator。为了更清晰地表达应用可进行的所有action,我们可以创建actionTypes.js文件，从中引入action，其中好处：

- 一个是我们可以在同一个文件中规范应用所有action的命名（因为你的程序不是说写出来就完了，更多的时候还需要后期维护更新）
- 定义action类型的文件类似于一个说明文档，当你想要为应用添加新特性时，可以查阅已有的应用action类型，这样可以避免冲突（我们在正式的开发当中肯定需要相互协作，添加功能的时候也不可能随性添加，要遵从之前的标准和规范）
- 每次代码提交到版本库时，我们也可以在这个文件中很轻松地查阅那些action类型被增加修改或删除了
- （可以减少一些typo错误）假如你打错字的话，在import这一步你的代码就会报错，这样方便你更快地调试，而不是在程序运行后才发现一些字符串错误。

### Reducer

[Action](http://cn.redux.js.org/docs/basics/Actions.html) 只是描述了**有事情发生了**这一事实，并没有指明应用如何更新 state。而这正是 reducer 要做的事情。

#### 设计state结构

在 Redux 应用中，所有的 state 都被保存在一个单一对象中。建议在写代码前先想一下这个对象的结构。如何才能以最简的形式把应用的 state 用对象描述出来？

> 开发复杂的应用时，不可避免会有一些数据相互引用。建议你尽可能地把 state 范式化，不存在嵌套。把所有数据放到一个对象里，每个数据以 ID 为主键，不同实体或列表间通过 ID 相互引用数据。把应用的 state 想像成数据库。

(previousState, action) => newState，在Redux中，我们把像这样的，根据应用现有状态和触发的action返回新的状态的函数称为reducer。reducer 就是一个纯函数，接收旧的 state 和 action，返回新的 state。

**永远不要**在 reducer 里做这些操作：

- 修改传入参数；
- 执行有副作用的操作，如 API 请求和路由跳转；
- 调用非纯函数，如 `Date.now()` 或 `Math.random()`。

我们可以开发一个函数来做为主 reducer，它调用多个子 reducer 分别处理 state 中的一部分数据，然后再把这些数据合成一个大的单一对象。主 reducer 并不需要设置初始化时完整的 state。初始时，如果传入 `undefined`, 子 reducer 将负责返回它们的默认值

### Store

在前面的章节中，我们学会了使用 [action](http://cn.redux.js.org/docs/basics/Actions.html) 来描述“发生了什么”，和使用 [reducers](http://cn.redux.js.org/docs/basics/Reducers.html) 来根据 action 更新 state 的用法。

**Store** 就是把它们联系到一起的对象。Store 有以下职责：

- 维持应用的 state；
- 提供 [`getState()`](http://cn.redux.js.org/docs/api/Store.html#getState) 方法获取 state；
- 提供 [`dispatch(action)`](http://cn.redux.js.org/docs/api/Store.html#dispatch) 方法更新 state；
- 通过 [`subscribe(listener)`](http://cn.redux.js.org/docs/api/Store.html#subscribe) 注册监听器;
- 通过 [`subscribe(listener)`](http://cn.redux.js.org/docs/api/Store.html#subscribe) 返回的函数注销监听器。

再次强调一下 **Redux 应用只有一个单一的 store**。当需要拆分数据处理逻辑时，你应该使用 [reducer 组合](http://cn.redux.js.org/docs/basics/Reducers.html#splitting-reducers)而不是创建多个 store。

根据已有的 reducer 来创建 store 是非常容易的。在[前一个章节](http://cn.redux.js.org/docs/basics/Reducers.html)中，我们使用 [`combineReducers()`](http://cn.redux.js.org/docs/api/combineReducers.html) 将多个 reducer 合并成为一个。现在我们将其导入，并传递 [`createStore()`](http://cn.redux.js.org/docs/api/createStore.html)。

我们使用redux编写应用时，首要的就是定义一个具体的store对象，因为不管是action还是reducer都是通过store当中的方法具体被调用了，而获取store需要使用到createstore方法，这个方法需要传入reducer作为参数，所以我们在编写代码时需要先写出reducer方法。话又绕了回来，reducer方法需要判断action的类型，所以事实上，最先要被定义好的应该是各种类型的action，action又是用来传入修改state状态数据的参数的，所以最早定义好的应该是应用的state状态数据。

我们在开发稍具规模的一些应用时，肯定是要先规划好应用要处理的数据结构。使用redux时最好先在一个单独的文件中定义好基本的action类型，其实这也就相当于在设计我们的应用都有哪些功能，用户可以触发哪些功能，对数据会造成什么影响。接下来就是获取到store，给我们的用户界面上面添加响应用户操作的事件，以及事件触发之后状态数据改变，我们的界面又要如何跟着响应改变。这其实也就是使用redux进行开发的一般思路啦。

容器组件：

容器组件就是使用 [`store.subscribe()`](http://cn.redux.js.org/docs/api/Store.html#subscribe) 从 Redux state 树中读取部分数据，并通过 props 来把这些数据提供给要渲染的组件。你可以手工来开发容器组件，但建议使用 React Redux 库的 [`connect()`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) 方法来生成，这个方法做了性能优化来避免很多不必要的重复渲染。（这样你就不必为了性能而手动实现 [React 性能优化建议](https://facebook.github.io/react/docs/advanced-performance.html) 中的 `shouldComponentUpdate` 方法。）

使用 `connect()` 前，需要先定义 `mapStateToProps` 这个函数来指定如何把当前 Redux store state 映射到展示组件的 props 中。例如，`VisibleTodoList` 需要计算传到 `TodoList` 中的 `todos`，所以定义了根据 `state.visibilityFilter` 来过滤 `state.todos` 的方法，并在 `mapStateToProps` 中使用。