class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload(){
    // Caminho correto
    this.load.image("marplaceholder", "assets/sprites/marplaceholder.png");
    this.load.image("pescadorplaceholder", "assets/sprites/pescadorplaceholder.png")
  }

  create() {
    // Quando usar uma imagem maior que a resolução base do jogo, use ese código, primeiro divida a resolução do jogo por 2
     const bg = this.add.image(683, 384, "marplaceholder");
    // Depois declare duas variáveis de scale e divida ela pelo withd e heigth da variável anterior
    const scaleX = 1366 / bg.width;
    const scaleY = 768 / bg.height;
    // Usa a maior escala para cobrir toda a tela (pode cortar partes da imagem)
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);

    const player = this.add.image(683, 600, "pescadorplaceholder");
    
    // TESTE: Altere este valor para ajustar o tamanho
    const sizePercentage = 0.08; // 12% da tela - experimente entre 0.08 e 0.20
    
    const boatScale = (1366 * sizePercentage) / player.width;
    player.setScale(boatScale);
    player.setOrigin(0.5, 1);
    
    // Adiciona controles para ajuste em tempo real (apenas para desenvolvimento)
    this.input.keyboard.on('keydown-Q', () => {
        player.setScale(player.scaleX * 1.1); // Aumenta 10%
    });
    
    this.input.keyboard.on('keydown-A', () => {
        player.setScale(player.scaleX * 0.9); // Diminui 10%
    });
  }
}


