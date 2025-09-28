class CreditsScene extends Phaser.Scene {
  constructor() {
    super("CreditsScene");
  }

  preload() {
    this.load.image("creditos", "assets/sprites/creditos.png");
  }

  create() {
    const centerX = this.game.config.width / 2;
    const centerY = this.game.config.height / 2;

    // Imagem de tutorial
    const tutorial = this.add.image(centerX, centerY, "creditos").setInteractive().on("pointerdown", () => {
        console.log("clicou");
      this.scene.start("MenuScene");
    });
    tutorial.setOrigin(0.5, 0.5);
    tutorial.setScale(1);
    tutorial.setDepth(1);
  }
}
