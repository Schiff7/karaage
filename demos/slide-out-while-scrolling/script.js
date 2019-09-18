const { fromEvent, from } = rxjs;
const { flatMap, throttleTime, startWith } = rxjs.operators;
const elements = document.querySelectorAll('[data-slide]');
const offsetToWindow = function offsetToWindow (ele, acc) {
  const parentEle = ele.offsetParent;
  return !parentEle 
    ? acc - (document.documentElement.scrollTop || document.body.scrollTop) 
    : offsetToWindow(parentEle, acc + ele.offsetTop);
}
fromEvent(document, 'scroll').pipe(
  startWith('init'),
  throttleTime(10),
  flatMap(_ => from(elements))
).subscribe((ele) => {
  const top = offsetToWindow(ele, 0);
  const direction = ele.getAttribute('data-slide');
  const ratio = 0.8;
  const height = window.innerHeight;
  const slidePending = `slide-${direction}-pending`;
  const slideFulfilled = 'slide-fulfilled';
  if (top > height * ratio && ele.classList.contains(slideFulfilled)) {
    ele.classList.replace(slideFulfilled, slidePending); return;
  }
  if (!ele.classList.contains(slidePending) && !ele.classList.contains(slideFulfilled)) 
    ele.classList.add(slidePending);
  if (top <= height * ratio) {
    ele.classList.replace(slidePending, slideFulfilled); return;
  }
})