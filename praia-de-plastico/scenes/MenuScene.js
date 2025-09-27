class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;


    const title = this.add.text(centerX, centerY - 50, "MENU PRINCIPAL", { fontSize: "24px", fill: "#fff" });
    title.setOrigin(0.5)
    const instruction = this.add.text(centerX, centerY + 50, "Pressione ESPAÇO para jogar", { fontSize: "18px", fill: "#aaa" });
    instruction.setOrigin(0.5)

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("MainScene");
    });
  }
}
