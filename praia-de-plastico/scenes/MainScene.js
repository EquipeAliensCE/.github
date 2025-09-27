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

    // CAMERA
    this.defaultZoom = 2.0; // Zoom padrão da câmera
    this.hookZoom = 1.0; // Zoom quando a câmera está seguindo o anzol
    this.cameraTweenDuration = 1000; // Duração do tween da câmera em ms

    // LIXO E DINHEIRO
    this.zonasDeLixo = []; // Array para armazenar as zonas de lixo
    this.tiposDeLixo = ['garrafa', 'osso', 'plástico', 'saco']; // Tipos de lixo disponíveis
    this.dinheiro = 0; // Dinheiro acumulado do jogador
    this.textoDinheiro = null; // Texto para mostrar o dinheiro na tela
    // Respawn de zonas
    this.ZONAS_TARGET = 6; // quantas zonas queremos manter ativas
    this.zoneRespawnDelay = 5000; // ms entre tentativas de respawn
    this.zoneRespawnTimer = 0; // contador
  }

  resetCamera() {
    // Transição suave com tween
    this.tweens.add({
      targets: this.cameras.main,
      zoom: this.defaultZoom,
      duration: this.cameraTweenDuration,
      ease: "Power2",
    });

    // Transição suave para seguir o player
    const cam = this.cameras.main;
    cam.startFollow(this.player);
    this.tweens.add({
      targets: cam._follow,
      lerp: 0.1,
      duration: this.cameraTweenDuration,
      ease: "Power2",
    });
  }

  preload() {
    this.load.image("marplaceholder", "assets/sprites/marplaceholder.png");
    this.load.image("barcoratosprite", "assets/sprites/barcoratosprite.png");
    this.load.image("anzolplaceholder", "assets/sprites/anzolplaceholder.png");
    this.load.image("garrafa", "assets/sprites/Garrafa.png");
    this.load.image("osso", "assets/sprites/Osso.png");
    this.load.image("plástico", "assets/sprites/plástico.png");
    this.load.image("saco", "assets/sprites/Saco.png");
  }

  create() {
    // Background
    const bg = this.add.image(683, 384, "marplaceholder");
    const scaleX = 1366 / bg.width;
    const scaleY = 768 / bg.height;
    const scale = Math.max(scaleX, scaleY); // Preenche a tela
    bg.setScale(scale);

    // Player
    this.player = this.add.image(683, 600, "barcoratosprite");
    const sizePercentage = 0.08;
    const boatScale = (1366 * sizePercentage) / this.player.width;
    this.player.setScale(boatScale);
    this.player.setOrigin(0.5, 1.8);

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

        // Câmera segue o anzol com zoom
        this.cameras.main.startFollow(this.hook);
        this.tweens.add({
          targets: this.cameras.main,
          zoom: this.hookZoom,
          duration: this.cameraTweenDuration,
          ease: "Power2",
        });
      }
    });

    // Camera
    // Faz a câmera seguir o player
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setFollowOffset(0, 0); // Centraliza o player na câmera
    this.cameras.main.setDeadzone(0, 0); // Remove a zona morta para seguir o player imediatamente

    // Define os limites da câmera (o mundo pode ser maior que a tela)
    this.cameras.main.setBounds(0, 0, 1366, 768); // Usando dimensões fixas do jogo

    // Aplica um zoom extra (metade da tela = zoom 2x no jogador)
    this.cameras.main.setZoom(1.8);

    // Criar zonas de lixo
    this.criarZonasDeLixo();

    // Criar UI fixa para o dinheiro (container para ficar junto da câmera)
    // Isso garante que o texto sempre apareça independente do zoom/scroll
    const moneyBg = this.add.rectangle(0, 0, 180, 48, 0x000000, 0.6).setOrigin(0);
    const moneyText = this.add.text(10, 8, 'R$ 0', {
      fontSize: '26px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0);
    this.uiMoney = this.add.container(16, 16, [moneyBg, moneyText]);
    this.uiMoney.setScrollFactor(0); // fixa na tela (não se move com a câmera)
    this.uiMoney.setDepth(10000);
    this.textoDinheiro = moneyText; // referencia para atualizações futuras
    // Garantir escala inicial estável (será ajustada no update conforme o zoom)
    this.uiMoney.setScale(1);
  }

  criarZonasDeLixo() {
    // Criar N zonas iniciais usando spawnSingleZone
    for (let i = 0; i < this.ZONAS_TARGET; i++) {
      // tenta encontrar uma posição adequada evitando sobreposição
      let attempts = 0;
      const minDistanceBetweenZones = 220;
      let x, y;
      do {
        const offsetX = Phaser.Math.Between(-500, 500);
        x = Phaser.Math.Clamp(this.player.x + offsetX, 60, 1366 - 60);
        const minY = this.player.y + 160;
        const maxY = Math.min(760, this.player.y + 520);
        y = Phaser.Math.Between(minY, maxY);
        y = Phaser.Math.Clamp(y, 200, 760);
        attempts++;
      } while (this.zonasDeLixo.some(z => Phaser.Math.Distance.Between(z.x, z.y, x, y) < minDistanceBetweenZones) && attempts < 40);

      this.spawnSingleZone(x, y);
    }
  }

  // Cria e retorna uma zona simples (usada no spawn inicial e no respawn)
  spawnSingleZone(x, y) {
    // Grupo visual que contém sprites de lixo para representar "mancha" de lixo
    const zonaGroup = this.add.group();
    const positions = [];
    // Pelo menos 3 itens por zona (pode repetir tipos)
    const needed = Phaser.Math.Between(3, 5);
    // Gera posições dentro da zona evitando sobreposição
    for (let j = 0; j < needed; j++) {
      let px, py, posAttempts = 0;
      do {
        px = Phaser.Math.Between(-50, 50);
        py = Phaser.Math.Between(-30, 30);
        posAttempts++;
      } while (positions.some(p => Phaser.Math.Distance.Between(p.x, p.y, px, py) < 40) && posAttempts < 30);
      positions.push({ x: px, y: py });
    }

    for (let k = 0; k < positions.length; k++) {
      const tipo = Phaser.Math.RND.pick(this.tiposDeLixo);
      const s = this.add.image(x + positions[k].x, y + positions[k].y, tipo);
      s.setScale(0.04);
      s.setAlpha(0.95);
      zonaGroup.add(s);
    }

    // Zona de colisão (invisível)
    const zonaLixo = this.add.zone(x, y, 160, 120);
    zonaLixo.x = x; // guardar posição para checagens futuras
    zonaLixo.y = y;
    zonaLixo.lixoGroup = zonaGroup;
    zonaLixo.coletas = 0; // Contador de coletas
    // Habilita física na zona somente se o plugin existir
    if (this.physics && this.physics.world && this.physics.world.enable) {
      this.physics.world.enable(zonaLixo);
      if (zonaLixo.body) {
        zonaLixo.body.setAllowGravity(false);
        zonaLixo.body.setImmovable(true);
      }
    }

    // Desenhar retângulo vermelho de debug e anexar para remoção posterior
    const g = this.add.graphics();
    g.lineStyle(2, 0xff0000);
    g.strokeRect(x - 80, y - 60, 160, 120);
    g.setDepth(100);
    zonaLixo.debugGraphics = g;

    this.zonasDeLixo.push(zonaLixo);
    return zonaLixo;
  }

  coletarLixo(zona) {
    // Incrementa contador de coletas desta zona
    zona.coletas = (zona.coletas || 0) + 1;

    // Escolher um tipo de lixo aleatório
    const lixoAleatorio = Phaser.Math.RND.pick(this.tiposDeLixo);

    // Criar sprite do lixo na posição do anzol
    const lixo = this.add.image(this.hook.x, this.hook.y, lixoAleatorio);
    lixo.setScale(0.05); // Ajustar escala do lixo

    // Adicionar dinheiro
    const valorLixo = Phaser.Math.Between(10, 50);
    this.dinheiro += valorLixo;
    if (this.textoDinheiro) this.textoDinheiro.setText(`R$ ${this.dinheiro}`);

    // Animação do lixo subindo
    this.tweens.add({
      targets: lixo,
      y: this.hook.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        lixo.destroy();
      }
    });

    // Se coletou 3 vezes, remove a zona com efeito
    const REMOVER_APOS = 3;
    if (zona.coletas >= REMOVER_APOS) {
      // Anima e destrói sprites do grupo de lixo
      if (zona.lixoGroup) {
        this.tweens.add({
          targets: zona.lixoGroup.getChildren(),
          alpha: 0,
          scale: 0,
          duration: 800,
          onComplete: () => {
            zona.lixoGroup.clear(true, true);
          }
        });
      }
      // Remove debug graphics se existir
      if (zona.debugGraphics) zona.debugGraphics.destroy();
      // Remove a zona da lista para não colidir mais
      const idx = this.zonasDeLixo.indexOf(zona);
      if (idx > -1) this.zonasDeLixo.splice(idx, 1);
    }

    // Iniciar retorno do anzol
    this.hookReturning = true;
  }

  throwHook() {
    // Cria o anzol
    this.hook = this.add.image(this.player.x, this.player.y - 95, "anzolplaceholder");
    const hookScale = 0.02; // Escala do anzol
    this.hook.setScale(hookScale);
    this.hook.setOrigin(0.5, 0.5);
    this.hookGravity = false;
    this.hookStartX = this.player.x;
    this.hookStartY = this.player.y - 10; // Posição inicial do anzol baseado na posição do player
    
    // Adiciona física ao anzol
    // Habilita física no anzol apenas se o plugin existir
    if (this.physics && this.physics.world && this.physics.world.enable) {
      this.physics.world.enable(this.hook);
      if (this.hook.body) this.hook.body.setAllowGravity(false);
    }
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
          this.resetCamera(); // Reset camera to follow player
          return;
        }

        // Voltar na direção da posição inicial
        const dirX = dx / distance;
        const dirY = dy / distance;
        this.hook.x += dirX * this.hookSpeed * deltaSeconds;
        this.hook.y += dirY * this.hookSpeed * deltaSeconds;
      }
    }

     if (this.hookGravity && !this.hookReturning) {
      // Verificar colisão com zonas de lixo
      this.zonasDeLixo.forEach(zona => {
        const bounds = zona.getBounds();
        if (Phaser.Geom.Rectangle.Contains(bounds, this.hook.x, this.hook.y)) {
          this.coletarLixo(zona);
        }
      });
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

    // Mantém o texto do dinheiro legível mesmo com zoom da câmera
    // Mantém o painel de dinheiro sempre visível e em escala 1 (fi xo na tela)
    if (this.uiMoney) {
      this.uiMoney.setScale(1);
      if (this.textoDinheiro) this.textoDinheiro.setScale(1);
    }

    // Respawn dinâmico de zonas: tenta manter pelo menos ZONAS_TARGET zonas
    this.zoneRespawnTimer += delta;
    if (this.zoneRespawnTimer >= this.zoneRespawnDelay) {
      this.zoneRespawnTimer = 0;
      // enquanto tivermos menos zonas que o alvo, spawn uma nova
      while (this.zonasDeLixo.length < this.ZONAS_TARGET) {
        // tenta achar uma posição válida
        let attempts = 0;
        const minDistanceBetweenZones = 220;
        let x, y;
        do {
          const offsetX = Phaser.Math.Between(-600, 600);
          x = Phaser.Math.Clamp(this.player.x + offsetX, 60, 1366 - 60);
          const minY = this.player.y + 180;
          const maxY = Math.min(760, this.player.y + 600);
          y = Phaser.Math.Between(minY, maxY);
          y = Phaser.Math.Clamp(y, 200, 760);
          attempts++;
        } while (this.zonasDeLixo.some(z => Phaser.Math.Distance.Between(z.x, z.y, x, y) < minDistanceBetweenZones) && attempts < 50);

        this.spawnSingleZone(x, y);
      }
    }
  }
}
