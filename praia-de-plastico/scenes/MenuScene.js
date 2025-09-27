class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }
  preload(){
    this.load.image("menuplaceholder", "assets/sprites/menuplaceholder.png")
  }

  create() {
    const bg = this.add.image(683, 384, "menuplaceholder");

    const scaleX = 1366 / bg.width;
    const scaleY = 768 / bg.height;

    const scale = Math.min(scaleX, scaleY);

    bg.setScale(scale);

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const title = this.add.text(centerX, centerY - 20, "MENU PRINCIPAL", { fontSize: "24px", fill: "#000000ff" });
    title.setOrigin(0.5)
    const instruction = this.add.text(centerX, centerY + 50, "Pressione ESPAÇO para jogar", { fontSize: "18px", fill: "#000000ff" });
    instruction.setOrigin(0.5)

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("MainScene");
    });
  }
}
