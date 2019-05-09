[//]: # ("tags": [ "CSS" ], "category": "Uncategorized")

# Work with CSS

There are two ways of writing CSS.

- Named an html element and style it.
- Named CSS pieces and put them on elements.

Things we focused on are absolutely different between the two ways.

As the view of the first way, we'll first give the target element a 'name', which is likely to determined by the practical meaning of the element. for example:

Here is a `div`

```html
<div></div>
```

We'd like it to be a panel in a page, so just name it with `panel`

```html
<div class='panel'></div>
```

Then switch consideration to it's styles, such as a red panel with 100% width.

```css
.panel {
  width: 100%;
  background-color: red;
}
```

Thinking only with the first way will always faced with issues of less reusability. If there are another `div` named `box` need the same styles as `panel`, you have to create another stylesheet:

```css
.box {
  width: 100%;
  background-color: red;
}
```

But with the second way, we are devoted to make reusable pieces of CSS. To style an element the same as the example above, we'll

Create a `div` first

```html
<div><div>
```

Create styles

```css
.bg-red {
  background-color: red;
}
.full-width {
  width: 100%;
}
```

Put them on `div`

```html
<div class='bg-red full-width'></div>
```

Although use the second way will significantly improve the reusability of CSS pieces, it also makes html files verbose under some circumstances:

```html
<ul>
  <li>...</li>
  <li>...</li>
  <li>...</li>
  .
  .
  .
<ul>
```

How should we give all `li`s the same styles such as red background? Although there exist the pieces `.bg-red` defined above, put it on every `li` like following maybe not the best practice.

```html
<ul>
  <li class='bg-red'>...</li>
  <li class='bg-red'>...</li>
  <li class='bg-red'>...</li>
  .
  .
  .
<ul>
```

I'd like name the parent node as a little namespace and use CSS selector to select all `li`s, which make things like the first way of writing CSS.

```html
<ul class='li-with-bg-red'>
  <li>...</li>
  <li>...</li>
  <li>...</li>
  .
  .
  .
<ul>
```

```css
ul.li-with-bg-red li {
  background-color: red;
}
```