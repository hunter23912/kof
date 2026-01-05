let AC_GAME_OBJECTS = [];

class AcGameObject {
  constructor() {
    AC_GAME_OBJECTS.push(this);

    this.timedelta = 0; // 当前帧距离上一帧的时间间隔，单位是毫秒
    this.has_called_start = false;
  }

  start() {
    // 只会在第一帧执行一次
  }

  update() {
    // 每一帧都会执行一次,除了第一帧
  }

  destroy() {
    // 删除当前对象
    for (let i in AC_GAME_OBJECTS) {
      // in枚举下标
      if (AC_GAME_OBJECTS[i] === this) {
        AC_GAME_OBJECTS.splice(i, 1);
        break;
      }
    }
  }
}

let last_timestamp;
let AC_GAME_OBJECTS_FRAME = (timestamp) => {
  for (let obj of AC_GAME_OBJECTS) {
    // of枚举值
    if (!obj.has_called_start) {
      obj.start();
      obj.has_called_start = true;
    } else {
      obj.timedelta = timestamp - last_timestamp;
      obj.update();
    }
  }
  last_timestamp = timestamp;
  requestAnimationFrame(AC_GAME_OBJECTS_FRAME);
};

requestAnimationFrame(AC_GAME_OBJECTS_FRAME);

export { AcGameObject };
