[//]: # ("tags": [ "React", "Generator", "Asynchronous" ], "category": "Uncategorized")

# 异步与状态管理

## 起因

最近在做的React单页应用（当前博客）需要异步从数据接口请求相关的数据，由于不希望把相关逻辑分散到各个组件里，产生了想要对组件的状态（主要为异步状态）进行集中管理的想法。项目在慢慢的用Typescript来重写，Redux原本对于这么小的应用（原本只分了两个文件）来说已经太重了，更不用说配上类型。我希望有一个更**简单**的，或许并不是well-design的，这是我想自己实现的理由。

## 想法

如果把状态管理的组件当作一个黑盒，当注册一个新的状态时，需要向其提供哪些信息？

以将提供的信息最小化进行考量的话，我认为有以下两点：

- 状态的当前值（或初始值）
- 状态的更新策略

状态当前值的话，很多时候一个对象就可以胜任。

如果状态是同步更新的，状态的更新策略可以是一个纯函数，它可能基于旧的状态（或者忽略），生成新的状态。

然而如果状态的更新需要执行异步操作，意味无法立即返回执行结果，此时不得不将修改状态的接口（副作用）传递到更新策略（函数）内部，作为异步操作的回调，此时纯函数将不再能胜任。同时相较于同步更新时状态由旧到新的直接转变，异步更新时旧的状态与新的状态之间多出一种中间态，此时更新策略已经被执行，旧的状态还没有被更新。这种状态是应该被应用所知晓的，需要执行一次状态的更新。

如果视状态的一次修改为更新策略的一种“产出”的话，同步操作往往只有一次“产出”。而异步的更新策略往往会有两次（中间态与完成态）或更多次“产出”。

综上，我们希望一个更新策略可以

- 可以有多次“产出”
- 尽可能从中排除副作用

如果一个函数作为一个更新策略本身就可以依次“产出”多个值，就不必将副作用导入策略内部，就可以在外部获取产出的状态值执行状态的更新操作。

## 关于 Generator

Continue...