const size = { width: 320, height: 180 };
const speedDown = 300;

// Config do jogo
const config = {
  type: Phaser.WEBGL,
  width: size.width,
  height: size.height,
  pixelArt: true, // para evitar blur
  zoom: 4, // 720p
  canvas: document.getElementById("gameCanvas"), // Usar getElementById pois é HTML seco
  backgroundColor: "#0d0d35",
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
