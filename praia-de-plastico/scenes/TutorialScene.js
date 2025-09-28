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
    tutorial.setScale(2);
    tutorial.setDepth(1);

    // // Botão
    // const button = this.add.image(centerX, centerY + 200, "btnStart");
    // button.setOrigin(0.5, 0.5);
    // button.setInteractive({ useHandCursor: true });
    // button.setScale(0.5);

    // // Texto em cima do botão (opcional)
    // this.add
    //   .text(centerX, centerY + 200, "Começar", {
    //     fontSize: "32px",
    //     color: "#ffffff",
    //     fontStyle: "bold",
    //   })
    //   .setOrigin(0.5);

    // // Clique no botão → fade para preto → troca de cena
    // button.on("pointerdown", () => {
    //   this.cameras.main.once("camerafadeoutcomplete", () => {
    //     this.scene.start("MainScene");
    //   });
    //   this.cameras.main.fadeOut(1000, 0, 0, 0); // 1s fade para preto
    // });
  }
}
