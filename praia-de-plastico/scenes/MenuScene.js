class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }
  preload() {
    this.load.image("menuplaceholder", "assets/sprites/menuplaceholder.png");
    this.load.image("menuSom", "assets/sprites/menuSom.png");
    this.load.image("menuSemSom", "assets/sprites/menuSemSom.png");
    this.load.image("ceuSol", "assets/sprites/ceuSol.png");
    this.load.image("aguaSuperficie", "assets/sprites/aguaSuperficie.png");
    this.load.image("rato", "assets/sprites/ratoIdle.png");
    this.load.image("barco", "assets/sprites/barcoSemFundo.png");
  }

  createButton(x, y, w, h, color, alpha = 1, rotation = 0, onClick) {
    const btn = this.add
      .rectangle(x, y, w, h, color)
      .setInteractive({ useHandCursor: true });
    btn.setAlpha(alpha);
    btn.setRotation(rotation);
    if (onClick) btn.on("pointerdown", onClick);
    return btn;
  }

  create() {
    var musica = true;

    this.createButton(350, 520, 200, 90, 0x0000ff, 0.5, 0.2, () => {
      this.scene.start("TutorialScene");
    }); // TORNAR OS BOTOES VISIVEIS ==> COLOCAR DEPOIS DO CODIGO DO BACKGROUND QUE TEM ESCRITO NO FINAL DESSE .TXT
    this.createButton(350, 600, 230, 40, 0xff00ff, 0.5, 0.13, () => {
      // COLOCAR FUNC DE MUTAR MUSICA NO IF, DESMUTAR MUSICA (REATIVAR) NO ELSE

      if (musica) {
        bgmenuSemSom.setVisible(true);
        musica = false;
      } else {
        bgmenuSemSom.setVisible(false);
        musica = true;
      }
    });
    this.createButton(350, 653, 230, 40, 0x0000ff, 0.5, 0.2, () => {
      this.scene.start("CreditsScene");
    });

    const bgSol = this.add.image(683, 384, "ceuSol");
    const bgAgua = this.add.image(683, 384, "aguaSuperficie");
    const bgmenuSom = this.add.image(330, 520, "menuSom").setScale(0.7);
    var bgmenuSemSom = this.add
      .image(330, 520, "menuSemSom")
      .setScale(0.7)
      .setVisible(false);
    const barco = this.add.image(990, 444, "barco").setScale(0.5);
    const bgrato = this.add.image(990, 540, "rato").setScale(0.2);
  }
}
