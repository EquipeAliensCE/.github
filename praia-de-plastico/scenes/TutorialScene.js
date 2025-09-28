class TutorialScene extends Phaser.Scene {
  constructor() {
    super("TutorialScene");
  }

  preload() {
    // Carregue a imagem do tutorial
    this.load.image("tutorial", "assets/sprites/tutorial.png");

    // // Carregue também um botão (ou use um retângulo com texto se não tiver sprite)
    // this.load.image("btnStart", "assets/sprites/btnStart.png");
  }

  create() {
    const centerX = this.game.config.width / 2;
    const centerY = this.game.config.height / 2;

    // Imagem de tutorial
    const tutorial = this.add.image(centerX, centerY, "tutorial");
    tutorial.setOrigin(0.5, 0.5);
    tutorial.setScale(1.15);
    tutorial.setDepth(1);

    // Dentro da cena atual
    setTimeout(() => {
      this.cameras.main.fadeOut(1000, 0, 0, 0); // 1000ms = 1 segundo, cor preta (RGB 0,0,0)
    }, 3000);

    // Quando o fade terminar, troca para a próxima cena
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("MainScene");
    });
  }
}
