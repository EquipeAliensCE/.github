const size = { width: 1366, height: 768 };
const speedDown = 300;
// Config do jogo
const config = {
  type: Phaser.WEBGL,
  width: size.width,
  height: size.height,
  pixelArt: false, // para evitar blur
  zoom: 1, // 720p

  canvas: document.getElementById("gameCanvas"), // Usar getElementById pois é HTML seco
  backgroundColor: "#227ce1",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: true,
    },
  },
  scene: [MenuScene, MainScene], // cena registrada aqui
};

// Inicializa o game
const game = new Phaser.Game(config);
