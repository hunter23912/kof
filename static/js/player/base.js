import { AcGameObject } from "/static/js/ac_game_object/base.js";

export class Player extends AcGameObject {
  constructor(root, info) {
    super();

    this.root = root;
    this.id = info.id;
    this.x = info.x;
    this.y = info.y;
    this.width = info.width;
    this.height = info.height;
    this.color = info.color;

    this.direction = 1; // 1表示面向右边，-1表示面向左边

    this.vx = 0;
    this.vy = 0;

    this.speedx = 400; // 水平速度
    this.speedy = -1200; // 跳起的初始速度

    this.gravity = 20; // 重力加速度

    this.ctx = this.root.game_map.ctx;
    this.pressed_keys = this.root.game_map.controller.pressed_keys;

    this.status = 3; // 0:待机 1:前进 2:后退 3:跳跃 4:攻击 5:受击 6:倒地

    this.animations = new Map();
    this.frame_current_cnt = 0;
  }

  start() {}

  update_control() {
    let w, a, d, space;
    if (this.id === 0) {
      w = this.pressed_keys.has("w");
      a = this.pressed_keys.has("a");
      d = this.pressed_keys.has("d");
      space = this.pressed_keys.has(" ");
    } else {
      w = this.pressed_keys.has("ArrowUp");
      a = this.pressed_keys.has("ArrowLeft");
      d = this.pressed_keys.has("ArrowRight");
      space = this.pressed_keys.has("Enter");
    }

    if (this.status === 0 || this.status === 1) {
      if (space) {
        this.status = 4;
        this.vx = 0;
        this.frame_current_cnt = 0; // 攻击动画重置
        // console.log("人物进行了攻击");
      } else if (w) {
        if (d) {
          this.vx = this.speedx;
        } else if (a) {
          this.vx = -this.speedx;
        } else {
          this.vx = 0;
        }

        this.vy = this.speedy;
        this.status = 3;
        this.frame_current_cnt = 0; // 跳跃动画重置，否则会接着上次的帧数播放***
      } else if (d) {
        this.vx = this.speedx;
        this.status = 1;
      } else if (a) {
        this.vx = -this.speedx;
        this.status = 1;
      } else {
        this.vx = 0;
        this.status = 0;
      }
    }
  }

  update_move() {
    if (this.status === 3) {
      this.vy += this.gravity;
    }
    this.x += (this.vx * this.timedelta) / 1000;
    this.y += (this.vy * this.timedelta) / 1000;

    if (this.y >= 450) {
      this.y = 450;
      this.vy = 0;
      if (this.status === 3) {
        this.status = 0;
        this.frame_current_cnt = 0;
      }
    }

    // 限制不能出界
    if (this.x < 0) {
      this.x = 0;
    } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
      this.x = this.root.game_map.$canvas.width() - this.width;
    }
  }

  update_direction() {
    let players = this.root.players;
    if (players[0] && players[1]) {
      let me = this,
        you = players[1 - this.id];
      if (me.x < you.x) {
        me.direction = 1;
      } else {
        me.direction = -1;
      }
    }
  }

  update() {
    this.update_control(); // 处理按键
    this.update_move(); // 处理移动
    this.update_direction(); // 处理朝向
    this.render(); // 画图
  }

  render() {
    let status = this.status;

    // 前进状态下，但速度为负值，则为后退状态
    if (this.status === 1 && this.direction * this.vx < 0) {
      status = 2;
    }

    let obj = this.animations.get(status);
    if (obj && obj.loaded) {
      if (this.direction > 0) {
        let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt; // 当前播放第k帧
        let image = obj.gif.frames[k].image;
        this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
      } else {
        this.ctx.save();
        const anchorX = this.x + this.width / 2;
        this.ctx.translate(anchorX, 0);
        this.ctx.scale(-1, 1); // 水平翻转

        let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt; // 当前播放第k帧
        let image = obj.gif.frames[k].image;

        this.ctx.drawImage(
          image,
          -this.width / 2,
          this.y + obj.offset_y,
          image.width * obj.scale,
          image.height * obj.scale
        );

        this.ctx.restore();
      }
    }

    if (status === 4 && this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {
      this.status = 0;
    }

    this.frame_current_cnt++; // 每帧计数器自增
  }
}
