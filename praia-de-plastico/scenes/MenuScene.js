class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.add.text(648, 384, "MENU PRINCIPAL", { fontSize: "24px", fill: "#fff" });
    this.add.text(30, 100, "Pressione ESPAÇO para jogar", { fontSize: "18px", fill: "#aaa" });

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("MainScene");
    });
  }
}
