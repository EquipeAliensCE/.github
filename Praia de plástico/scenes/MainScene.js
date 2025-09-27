class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  create() {
    this.add.text(50, 50, "Funcionou!", {
      fontSize: "32px",
      fill: "#fff",
    });
  }
}
