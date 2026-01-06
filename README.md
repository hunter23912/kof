# 一个自制的拳皇 KOF 小游戏

### 如何测试一个显示器中浏览器的帧率？

在控制台直接执行：

```javascript
let last = performance.now(),
  frames = 0;
function testFPS(tt) {
  frames++;
  // console.log(tt);
  let now = performance.now();
  if (now - last >= 1000) {
    console.log("FPS:", frames);
    frames = 0;
    last = now;
  }
  requestAnimationFrame(testFPS);
}
testFPS();
```
