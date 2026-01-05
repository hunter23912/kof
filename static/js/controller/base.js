export class Controller {
  constructor($canvas) {
    this.$canvas = $canvas;

    this.pressed_keys = new Set();
    this.start();
  }

  start() {
    this.$canvas.keydown((e) => {
      this.pressed_keys.add(e.key);
    });

    this.$canvas.keyup((e) => {
      this.pressed_keys.delete(e.key);
    });
  }
}
