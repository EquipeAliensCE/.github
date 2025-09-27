class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.playerSpeed = 300;
    this.acceleration = 600; // Aceleração para movimento mais suave
    this.deceleration = 800; // Desaceleração
    this.cursors = null;
    this.playerVelocityX = 0;
    this.hook = null;
    this.hookStartX = 0; // New: stores initial X position
    this.hookStartY = 0; // New: stores initial Y position
    this.hookVelocityX = 0;
    this.hookVelocityY = 0;
    this.hookSpeed = 300; // Velocidade de descida do anzol
    this.hookGravity = false;
    this.hookReturning = false; // New: tracks if hook is returning
    this.hookSwingSpeed = 120;
    this.hookSwingDirection = 1;
    this.isHookSwinging = false;
  }

  preload() {
    this.load.image("marplaceholder", "assets/sprites/marplaceholder.png");
    this.load.image("barcoratosprite", "assets/sprites/barcoratosprite.png");
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
    this.player = this.add.image(683, 600, "barcoratosprite");
    const sizePercentage = 0.12;
    const boatScale = (1366 * sizePercentage) / this.player.width;
    this.player.setScale(boatScale);
    this.player.setOrigin(0.5, 1);

    // Configura as teclas
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // Controle para lançar o anzol
    this.input.keyboard.on("keydown-SPACE", () => {
      if (!this.hook) {
        this.throwHook();
        this.isHookSwinging = true;
      } else if (this.isHookSwinging) {
        // Calcula as velocidades baseadas no ângulo
        const angleRad = Phaser.Math.DegToRad(this.hook.angle - 90); // -90 para corrigir o ângulo
        this.hookVelocityX = Math.cos(angleRad) * this.hookThrowSpeed;
        this.hookVelocityY = Math.sin(angleRad) * this.hookThrowSpeed;

        this.isHookSwinging = false;
        this.hookGravity = true;
      }
    });
  }

  throwHook() {
    // Cria o anzol
    this.hook = this.add.image(
      this.player.x,
      this.player.y - 10,
      "anzolplaceholder"
    );
    const hookScale = 0.03;
    this.hook.setScale(hookScale);
    this.hook.setOrigin(0.5, 0.5);
    this.hookGravity = false;
    this.hookStartX = this.player.x;
    this.hookStartY = this.player.y - 10;
  }

  updateHookMovement(delta) {
    if (!this.hook) return;

    const deltaSeconds = delta / 1000;

    if (this.isHookSwinging) {
      // movimento pendular
      this.hook.angle +=
        this.hookSwingSpeed * this.hookSwingDirection * deltaSeconds;

      // Inverte a direção nos limites
      if (this.hook.angle >= 90) {
        this.hook.angle = 90;
        this.hookSwingDirection = -1;
      } else if (this.hook.angle <= -90) {
        this.hook.angle = -90;
        this.hookSwingDirection = 1;
      }
    } else if (this.hookGravity) {
      // Converte o ângulo para radianos e ajusta para que 0° seja para baixo
      const angleRad = Phaser.Math.DegToRad(this.hook.angle - 90);

      // Calcula as componentes do movimento
      const moveX = Math.cos(angleRad) * this.hookSpeed * deltaSeconds;
      const moveY = Math.sin(angleRad) * this.hookSpeed * deltaSeconds;

      if (!this.hookReturning) {
        // Moving outward
        this.hook.x -= moveX;
        this.hook.y -= moveY;

        // Check for screen boundaries
        if (
          this.hook.y > 768 ||
          this.hook.y < 0 ||
          this.hook.x < 0 ||
          this.hook.x > 1366
        ) {
          this.hookReturning = true;
        }
      } else {
        // Returning to original position
        const dx = this.hookStartX - this.hook.x;
        const dy = this.hookStartY - this.hook.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          // Close enough to original position
          this.hook.destroy();
          this.hook = null;
          this.isHookSwinging = false;
          this.hookGravity = false;
          this.hookReturning = false;
          return;
        }

        // Move towards original position
        const dirX = dx / distance;
        const dirY = dy / distance;
        this.hook.x += dirX * this.hookSpeed * deltaSeconds;
        this.hook.y += dirY * this.hookSpeed * deltaSeconds;
      }
    }
  }

  update(time, delta) {
    // Movimento do barco com aceleração suave
    this.movePlayer(delta);

    this.updateHookMovement(delta); // Atualiza o movimento oscilante do anzol
  }

  movePlayer(delta) {
    const deltaTime = delta / 1000; // Converte para segundos

    // Aceleração/desaceleração
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setFlipX(false); // Olha para a direita
      this.playerVelocityX -= this.acceleration * deltaTime;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setFlipX(true); // Olha para a esquerda
      this.playerVelocityX += this.acceleration * deltaTime;
    } else {
      // Desaceleração quando nenhuma tecla está pressionada
      if (this.playerVelocityX > 0) {
        // Movendo para a direita
        this.playerVelocityX = Math.max(
          0,
          this.playerVelocityX - this.deceleration * deltaTime
        );
      } else if (this.playerVelocityX < 0) {
        // Movendo para a esquerda
        this.playerVelocityX = Math.min(
          0,
          this.playerVelocityX + this.deceleration * deltaTime
        );
      }
    }

    // Limita a velocidade máxima
    this.playerVelocityX = Phaser.Math.Clamp(
      this.playerVelocityX,
      -this.playerSpeed,
      this.playerSpeed
    );

    // Aplica o movimento
    this.player.x += this.playerVelocityX * deltaTime;

    // Limita o movimento para não sair da tela
    const playerWidth = this.player.displayWidth;
    this.player.x = Phaser.Math.Clamp(
      this.player.x,
      playerWidth / 2,
      1366 - playerWidth / 2
    );
  }
}
