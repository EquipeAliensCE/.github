// 1. Consts globais
const size = { width: 500, height: 500 };
const speedDown = 300;

// 2. Cena
class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  create() {
    this.add.text(100, 200, "Funcionou!", {
      fontSize: "32px",
      fill: "#fff",
    });
  }
}

// 3. Config do jogo
const config = {
  type: Phaser.WEBGL,
  width: size.width,
  height: size.height,
  canvas: document.getElementById("gameCanvas"), // Usar getElementById pois é HTML seco
  backgroundColor: "#0d0d35",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: true,
    },
  },
  scene: [MainScene], // cena registrada aqui
};

// 4. Inicializa o game
const game = new Phaser.Game(config);
