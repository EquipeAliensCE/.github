class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.hook = null;
    this.hookSpeed = 300;
    this.playerSpeed = 300;
    this.acceleration = 600; // Aceleração para movimento mais suave
    this.deceleration = 800; // Desaceleração
    this.cursors = null;
    this.playerVelocityX = 0;
  }

  preload(){
    this.load.image("marplaceholder", "assets/sprites/marplaceholder.png");
    this.load.image("pescadorplaceholder", "assets/sprites/pescadorplaceholder.png");
    this.load.image("anzolplaceholder", "assets/sprites/anzolplaceholder.png");
  }

  create() {
    // Background
    const bg = this.add.image(683, 384, "marplaceholder");
    const scaleX = 1366 / bg.width;
    const scaleY = 768 / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);

    // Player
    this.player = this.add.image(683, 600, "pescadorplaceholder");
    const sizePercentage = 0.08;
    const boatScale = (1366 * sizePercentage) / this.player.width;
    this.player.setScale(boatScale);
    this.player.setOrigin(0.5, 1);
    
    // Configura as teclas
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // Controle para lançar o anzol
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.hook) {
        this.throwHook();
      }
    });
  }

  throwHook() {
    // Cria o anzol
    this.hook = this.add.image(this.player.x, this.player.y - 10, "anzolplaceholder");
    const hookScale = 0.03;
    this.hook.setScale(hookScale);
    this.hook.setOrigin(0.5, 0.5);
  }

  update(time, delta) {
    // Movimento do barco com aceleração suave
    this.movePlayer(delta);
    
    // Movimento do anzol
    if (this.hook) {
      this.hook.y += (this.hookSpeed * delta) / 1000;
      
      // Remove quando sair da tela
      if (this.hook.y > 768) {
        this.hook.destroy();
        this.hook = null;
      }
    }
  }

  movePlayer(delta) {
    const deltaTime = delta / 1000; // Converte para segundos
    
    // Aceleração/desaceleração
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.playerVelocityX -= this.acceleration * deltaTime;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.playerVelocityX += this.acceleration * deltaTime;
    } else {
      // Desaceleração quando nenhuma tecla está pressionada
      if (this.playerVelocityX > 0) {
        this.playerVelocityX = Math.max(0, this.playerVelocityX - this.deceleration * deltaTime);
      } else if (this.playerVelocityX < 0) {
        this.playerVelocityX = Math.min(0, this.playerVelocityX + this.deceleration * deltaTime);
      }
    }
    
    // Limita a velocidade máxima
    this.playerVelocityX = Phaser.Math.Clamp(this.playerVelocityX, -this.playerSpeed, this.playerSpeed);
    
    // Aplica o movimento
    this.player.x += this.playerVelocityX * deltaTime;
    
    // Limita o movimento para não sair da tela
    const playerWidth = this.player.displayWidth;
    this.player.x = Phaser.Math.Clamp(this.player.x, playerWidth/2, 1366 - playerWidth/2);
  }
}