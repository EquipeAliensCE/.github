class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");

    // PLAYER
    this.playerSpeed = 300; // Velocidade do Player
    this.acceleration = 600; // Aceleração para movimento mais suave
    this.deceleration = 800; // Desaceleração
    this.cursors = null; // Cursor keys
    this.playerVelocityX = 0; // Velocidade atual do player

    // HOOK
    this.hook = null; // Anzol
    this.hookStartX = 0; // Posição inicial X do anzol
    this.hookStartY = 0; // Posição inicial Y do anzol
    this.hookVelocityX = 0; // Velocidade atual X do anzol
    this.hookVelocityY = 0; // Velocidade atual Y do anzol
    this.hookSpeed = 300; // Velocidade de descida do anzol
    this.hookGravity = false; // Se o anzol está caindo
    this.hookReturning = false; // Se o anzol está retornando
    this.hookSwingSpeed = 120; // Velocidade de oscilação do anzol
    this.hookSwingDirection = 1; // Direção da oscilação (1 pra direita ou -1 pra esquerda)
    this.isHookSwinging = false; // Se o anzol está oscilando
  }

  preload() {
    this.load.image("marplaceholder", "assets/sprites/marplaceholder.png"); // Placeholder do mar
    this.load.image(
      "pescadorplaceholder", // Placeholder do pescador
      "assets/sprites/pescadorplaceholder.png"
    );
    this.load.image("anzolplaceholder", "assets/sprites/anzolplaceholder.png"); // Placeholder do anzol
  }

  create() {
    // Background
    const bg = this.add.image(683, 384, "marplaceholder");
    const scaleX = 1366 / bg.width;
    const scaleY = 768 / bg.height;
    const scale = Math.max(scaleX, scaleY); // Preenche a tela
    bg.setScale(scale);

    // Player
    this.player = this.add.image(683, 600, "pescadorplaceholder");
    const sizePercentage = 0.08;
    const boatScale = (1366 * sizePercentage) / this.player.width; // Escala baseada na largura da tela (eu acho que é 1/12 do tamanho da tela)
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
        this.isHookSwinging = true; // Checa se o anzol está oscilando
      } else if (this.isHookSwinging) {
        // Calcula as velocidades baseadas no ângulo
        const angleRad = Phaser.Math.DegToRad(this.hook.angle - 90); // -90 para corrigir o ângulo
        this.hookVelocityX = Math.cos(angleRad) * this.hookThrowSpeed; // Altera a velocidade X com base na hookThrowSpeed e angulo
        this.hookVelocityY = Math.sin(angleRad) * this.hookThrowSpeed; // Altera a velocidade Y com base na hookThrowSpeed e angulo

        this.isHookSwinging = false; // Para de oscilar
        this.hookGravity = true; // Começa a cair
      }
    });

    // Camera
    // Faz a câmera seguir o player
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Define os limites da câmera (o mundo pode ser maior que a tela)
    this.cameras.main.setBounds(0, 0, size.width, size.height);

    // Aplica um zoom extra (metade da tela = zoom 2x no jogador)
    this.cameras.main.setZoom(1.5);
  }

  throwHook() {
    // Cria o anzol
    this.hook = this.add.image(
      this.player.x,
      this.player.y - 10,
      "anzolplaceholder"
    );
    const hookScale = 0.03; // Escala do anzol
    this.hook.setScale(hookScale);
    this.hook.setOrigin(0.5, 0.5);
    this.hookGravity = false;
    this.hookStartX = this.player.x;
    this.hookStartY = this.player.y - 10; // Posição inicial do anzol baseado na posição do player
  }

  updateHookMovement(delta) {
    if (!this.hook) return;

    const deltaSeconds = delta / 1000; // Delta em segundos

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
        // Movimento para frente
        this.hook.x -= moveX;
        this.hook.y -= moveY;

        // Checa se saiu da tela
        if (
          this.hook.y > 768 ||
          this.hook.y < 0 ||
          this.hook.x < 0 ||
          this.hook.x > 1366
        ) {
          this.hookReturning = true;
        }
      } else {
        // Retorno do anzol para a posição inicial
        const dx = this.hookStartX - this.hook.x;
        const dy = this.hookStartY - this.hook.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          // Perto o suficiente da posição inicial
          this.hook.destroy(); // Remove o anzol
          console.log("Anzol retornou e foi removido");
          this.hook = null;
          this.isHookSwinging = false;
          this.hookGravity = false;
          this.hookReturning = false;
          return;
        }

        // Voltar na direção da posição inicial
        const dirX = dx / distance;
        const dirY = dy / distance;
        this.hook.x += dirX * this.hookSpeed * deltaSeconds;
        this.hook.y += dirY * this.hookSpeed * deltaSeconds;
      }
    }
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

  update(time, delta) {
    // Movimento do barco com aceleração suave
    this.movePlayer(delta);

    this.updateHookMovement(delta); // Atualiza o movimento oscilante do anzol
  }
}
