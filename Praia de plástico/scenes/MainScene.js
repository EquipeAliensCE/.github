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
