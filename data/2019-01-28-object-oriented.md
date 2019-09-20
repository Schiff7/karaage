[//]: # ("tags": [ "JavaScript", "OOP" ], "category": "Uncategorized")

# 面向对象的实现方式

## 以类作为模板

```c++
// C++
class A {
  private:
    int foo = 0;
  public:
    int bar() const {
      // return this->foo;
      return foo;
    }
}
A a;
a.bar();
```

以上代码通过调用默认构造函数生成了`A`类的一个实例，并对成员函数`bar`进行了调用。实例生成的过程中，没有产生`bar`函数的拷贝，调用过程可以等价为以下的伪代码：

```c++
A::bar(&a);
```

即在实例上调用实例方法的过程仍是对类方法的调用，只是在调用的时候将指向当前实例的`this`以隐式形参的方式传递给被调用函数。

## 构造函数和原型链

关于 `prototype`

```javascript
// Javascript
function A() {
  this.foo = 0;
  this.bar = function() {
    return this.foo;
  }
}
const a = new A();
const b = new A();
a.bar === b.bar; // false;
```

JavaScript可以使用`new`关键字执行构造函数来获得多个类型特点一致的对象，`new`关键字的执行过程可简单理解为：

```javascript
function _new(_constructor, ...params) {
  // 创建一个空对象。
  const temp = {};

  // 执行构造函数。
  _constructor.apply(temp, [...params]);

  // 返回新的对象，不考虑构造函数中显式return的情况。
  return temp;
}
```

利用这种方式获得对象会存在一个问题：在上面代码中，`a`和`b`是两个独立的实体。类模板实现的面向对象中所有对实例方法的调用都是调用类方法本身，而此处`a`和`b`的`bar`方法虽然完全一样，但是却是各自占用了一份内存资源。

对比类模板中将方法置于抽象的较高层“类”中，利用对象和类的映射关系来完成对系统资源的复用，Javascript中也存在对象和构造函数的映射关系，那么在构造函数之外还需要一个空间，被所有由指定构造函数生成的全部对象所共享，来使得类似于以上`foo`函数在被所有实例调用的时候是指向该共享空间的同一个副本，我认为这就是`prototype`的存在理由（在ES6的class中，所有类方法都是被绑定在`prototype`上的，从结果上来看和类模板是很相似，都保证了对象调用的类方法只有一个副本）。

`prototype`作为构造函数的一个属性，与构造函数绑定在一起，所有由该构造函数生成的对象，都会包含一个`__proto__`属性指向构造函数的`prototype`，如果调用的某个属性无法在当前对象中找到，就会尝试在对象的`__proto__`中搜寻该属性。

重写之前的构造函数，则有：

```javascript
function A() {
  this.foo = 0;
}
A.prototype.bar = function() {
    return this.foo;
}

const a = new A();
a.__proto__ === A.prototype; // true;
const b = new A();
a.bar === b.bar; // true;
```

重新描述`new`关键字的执行过程：

```javascript
function _new(_constructor, ...params) {
  // 创建一个空对象，并将该空对象的__proto__指向构造函数的prototype
  // Object.create()用于以某个对象为原型对象（即__proto__所指向的）创建新的对象
  const temp = Object.create(_constructor.prototype);

  // 执行构造函数。
  _constructor.apply(temp, [...params]);

  // 返回新的对象，不考虑构造函数中显式return的情况。
  return temp;
}
```

继承的实现

~~继承解决的是代码复用和扩展的问题。子类继承父类，子类可以使用父类已经定义好的方法和属性，这实现了复用。子类可以定义父类没有的方法、属性，或者覆盖父类已有的方法或属性，这实现了扩展。~~

```javascript
// 假设B继承A，C继承B
function A() {};

function B() {
  // 通过改变A的构造函数中this的指向，在B中生成A的属性
  A.call(this);
}
// 生成一个新的对象，它的__proto__指向A的prototype的，将其作为B的prototype
B.prototype = Object.create(A.prototype);
// 将新prototype的constructor属性指向B
B.prototype.constructor = B;

// C继承B，同上
function C() { B.call(this); }
C.prototype = Object.create(B.prototype);
C.prototype.constructor = C;

const c = new C();

// instanceof 获得右侧构造函数的原型（prototype），延着左侧对象的__proto__属性向上查找，存在两者相同则返回true
c instanceof A; // true;
c instanceof B; // true;
c instanceof C; // true;
```

调用子类对象的某个方法或取某个属性，如果未能在当前对象中找到，便延着`__proto__`属性向上查找，这种链状的调用也就是原型链。
