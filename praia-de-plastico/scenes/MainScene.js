class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload(){
    // Caminho correto - sem a barra no início
    this.load.image("marplaceholder", "assets/sprites/marplaceholder.png");
  }

  create() {
    // Adicione .setOrigin(0,0) apenas se quiser alinhar pelo canto superior esquerdo
     const bg = this.add.image(160, 90, "marplaceholder");
    
    // Calcula a escala necessária para cobrir a tela
    const scaleX = 320 / bg.width;
    const scaleY = 180 / bg.height;
    
    // Usa a maior escala para cobrir toda a tela (pode cortar partes da imagem)
    const scale = Math.max(scaleX, scaleY);
    
    bg.setScale(scale);
  }
}


