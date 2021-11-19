import GameScene from "./game.js";

var config = {
  parent: "phaser-game",
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "phaser-game",
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    width: 1280,
    height: 720,
    min: {
      width: 480,
      height: 360,
    },
    max: {
      width: 1280,
      height: 720,
    },
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);
