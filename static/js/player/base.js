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

    this.hp = 100;
    this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}`);
    this.$hp_back = this.root.$kof.find(`.kof-head-hp-${this.id}-back`);
    this.$hp_front = this.root.$kof.find(`.kof-head-hp-${this.id}-back-front`);
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
    this.vy += this.gravity; // 对所有状态都适用重力加速度
    this.x += (this.vx * this.timedelta) / 1000;
    this.y += (this.vy * this.timedelta) / 1000;

    let [a, b] = this.root.players;

    let r1 = {
      // 一个人物的左上角和右下角
      x1: a.x,
      y1: a.y,
      x2: a.x + a.width,
      y2: a.y + a.height,
    };
    let r2 = {
      x1: b.x,
      y1: b.y,
      x2: b.x + b.width,
      y2: b.y + b.height,
    };

    // 设置碰撞体积
    if (this.is_collision(r1, r2)) {
      // 只由 id === 0 处理碰撞响应，避免每个玩家各自处理一次造成重复位移
      if (this.id === 0) {
        // 计算重叠量（正值表示有重叠）
        const overlapX = Math.min(r1.x2, r2.x2) - Math.max(r1.x1, r2.x1);
        const overlapY = Math.min(r1.y2, r2.y2) - Math.max(r1.y1, r2.y1);

        if (overlapX > 0 && overlapY > 0) {
          // 优先沿最小穿透轴分离
          if (overlapX < overlapY) {
            const push = overlapX / 2;
            // a 在左侧则 a 向左推，b 向右推（反之亦然）
            if (a.x < b.x) {
              a.x -= push;
              b.x += push;
            } else {
              a.x += push;
              b.x -= push;
            }
            // 水平速度阻尼，避免穿透后继续挤压
            a.vx = 0;
            b.vx = 0;
          } else {
            const push = overlapY / 2;
            // 垂直分离（上者向上推，下者向下推）
            if (a.y < b.y) {
              a.y -= push;
              b.y += push;
            } else {
              a.y += push;
              b.y -= push;
            }
            a.vy = 0;
            b.vy = 0;
          }
        }
      }
    }

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
    if (this.status === 6) return; // 倒地状态不改变朝向

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

  is_collision(r1, r2) {
    // r1, r2表示两个矩形，包含属性x1,y1,x2,y2
    if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2)) {
      return false;
    }

    if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2)) {
      return false;
    }
    return true;
  }

  is_attack() {
    if (this.status === 6) return; // 倒地状态无法受击
    this.status = 5;
    this.frame_current_cnt = 0;

    this.hp = Math.max(this.hp - 10, 0);

    // 前景血条变化
    this.$hp_front.animate(
      {
        width: (this.$hp.width() * this.hp) / 100,
      },
      300
    );
    // 底色血条变化
    this.$hp_back.animate(
      {
        width: (this.$hp.width() * this.hp) / 100,
      },
      600
    );

    if (this.hp <= 0) {
      this.status = 6;
      this.frame_current_cnt = 0;
      this.vx = 0;
    }
  }

  update_attack() {
    if (this.status == 4 && this.frame_current_cnt == 54) {
      let me = this,
        you = this.root.players[1 - this.id];
      let r1;
      if (me.direction > 0) {
        r1 = {
          x1: me.x + 120,
          y1: me.y + 42,
          x2: me.x + 120 + 100,
          y2: me.y + 42 + 20,
        };
      } else {
        r1 = {
          x1: me.x + me.width - 120 - 100,
          y1: me.y + 42,
          x2: me.x + me.width - 120,
          y2: me.y + 42 + 20,
        };
      }

      let r2 = {
        x1: you.x,
        y1: you.y,
        x2: you.x + you.width,
        y2: you.y + you.height,
      };

      // 如果两个矩形有交集
      if (this.is_collision(r1, r2)) {
        you.is_attack(); // 受击动画
      }
    }
  }

  update() {
    this.update_control(); // 处理按键
    this.update_move(); // 处理移动
    this.update_direction(); // 处理朝向、
    this.update_attack();
    this.render(); // 画图
  }

  render() {
    // 测试用：绘制人物的矩形边框及攻击矩形范围
    // this.ctx.fillStyle = "blue";
    // this.ctx.fillRect(this.x, this.y, this.width, this.height);

    // if (this.direction > 0) {
    //   this.ctx.fillStyle = "red";
    //   this.ctx.fillRect(this.x + 120, this.y + 42, 100, 20);
    // } else {
    //   this.ctx.fillStyle = "red";
    //   this.ctx.fillRect(this.x + this.width - 120 - 100, this.y + 42, 100, 20);
    // }

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

    if (status === 4 || this.status === 5 || this.status === 6) {
      if (this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {
        if (this.status === 6) {
          this.frame_current_cnt--;
        } else {
          this.status = 0;
        }
      }
    }

    this.frame_current_cnt++; // 每帧计数器自增
  }
}
