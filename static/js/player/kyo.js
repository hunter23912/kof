import { Player } from "/static/js/player/base.js";
import { GIF } from "/static/js/utils/gif.js";

export class Kyo extends Player {
  constructor(root, info) {
    super(root, info);

    this.init_animations();
  }

  init_animations() {
    let offsets = [0, -22, -22, -140, 0, 0, 0];
    for (let i = 0; i < 7; i++) {
      let gif = new GIF();
      gif.load(`/static/images/player/kyo/${i}.gif`);
      // 每个动作对应一个gif
      this.animations.set(i, {
        gif: gif,
        frame_cnt: 0, // 总图片数
        frame_rate: 15, // 每15浏览器帧过渡一次,数值越小动画越快
        offset_y: offsets[i], // y轴偏移
        loaded: false, // 是否加载完毕
        scale: 2, // 放大倍数
      });

      // 取出帧数
      gif.onload = () => {
        let obj = this.animations.get(i);

        obj.frame_cnt = gif.frames.length;
        obj.loaded = true;
        if (i === 3) {
          obj.frame_rate = 12;
        }
        if (i === 4) {
          obj.frame_rate = 12;
        }
      };
    }
  }
}
