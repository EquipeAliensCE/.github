class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.initGameConfig();
  }

  // CONFIGURAÇÕES INICIAIS
  initGameConfig() {
    // Game
    this.gameConfig = {
      width: 1366,
      height: 768,
    };

    // Player
    this.playerConfig = {
      speed: 300,
      acceleration: 600,
      deceleration: 800,
      velocityX: 0,
      canMove: true,
    };

    // Hook
    this.hookConfig = {
      hook: null,
      startX: 0,
      startY: 0,
      velocityX: 0,
      velocityY: 0,
      throwSpeed: 400,
      speed: 300,
      gravity: false,
      returning: false,
      swingSpeed: 120,
      swingDirection: 1,
      isSwinging: false,
    };

    // Camera
    this.cameraConfig = {
      defaultZoom: 2.0,
      hookZoom: 1.5,
      tweenDuration: 1000,
    };

    // Trash
    this.trashConfig = {
      zones: [],
      types: ["garrafa", "osso", "plástico", "saco"],
      targetZones: 6,
      respawnDelay: 5000,
      respawnTimer: 0,
      minDistance: 250, // Aumentei a distância mínima
      maxSpawnAttempts: 50, // Número máximo de tentativas de spawn
      spawnArea: {
        minX: 100,
        maxX: 1266,
        minY: 250,
        maxY: 700
      }
    };

    this.zonasDeLixo = [];

    // UI
    this.uiConfig = {
      money: 0,
      moneyText: null,
      moneyContainer: null,
    };
  }

  // PRELOAD
  preload() {
    this.load.image("marplaceholder", "assets/sprites/marplaceholder.png");
    this.load.image("barcoratosprite", "assets/sprites/barcoratosprite.png");
    this.load.image("anzolplaceholder", "assets/sprites/anzolplaceholder.png");
    this.load.image("garrafa", "assets/sprites/Garrafa.png");
    this.load.image("osso", "assets/sprites/Osso.png");
    this.load.image("plástico", "assets/sprites/plástico.png");
    this.load.image("saco", "assets/sprites/Saco.png");
  }

  // LOAD ASSETS
  loadAssets() {
    const assets = [
      { key: "marplaceholder", path: "assets/sprites/marplaceholder.png" },
      { key: "barcoratosprite", path: "assets/sprites/barcoratosprite.png" },
      { key: "anzolplaceholder", path: "assets/sprites/anzolplaceholder.png" },
      { key: "garrafa", path: "assets/sprites/Garrafa.png" },
      { key: "osso", path: "assets/sprites/Osso.png" },
      { key: "plástico", path: "assets/sprites/plástico.png" },
      { key: "saco", path: "assets/sprites/Saco.png" },
    ];

    assets.forEach((asset) => this.load.image(asset.key, asset.path));
  }

  create() {
    this.setupBackground();
    this.setupPlayer();
    this.setupInputs();
    this.setupCamera();
    this.setupTrashZones();
    this.setupMoneyUI();
  }

  // SETUP METHODS

  setupBackground() {
    const bg = this.add.image(
      this.gameConfig.width / 2,
      this.gameConfig.height / 2,
      "marplaceholder"
    );
    const scaleX = this.gameConfig.width / bg.width;
    const scaleY = this.gameConfig.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));
  }

  setupPlayer() {
    this.player = this.add.image(
      this.gameConfig.width / 2,
      700,
      "barcoratosprite"
    );
    const scale = (this.gameConfig.width * 0.08) / this.player.width;
    this.player.setScale(scale).setOrigin(0.5, 1.8);
  }

  setupInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.setupHookControls();
  }

  setupCamera() {
    const cam = this.cameras.main;
    cam.startFollow(this.player, true);
    cam.setFollowOffset(0, 0);
    cam.setDeadzone(0, 0);
    cam.setBounds(0, 0, this.gameConfig.width, this.gameConfig.height);
    cam.setZoom(this.cameraConfig.defaultZoom);
  }

  setupMoneyUI() {
    // CORREÇÃO: Criar a UI em coordenadas de tela fixas
    const screenWidth = this.cameras.main.width;
    
    // Background preto semi-transparente
    const moneyBg = this.add
      .rectangle(0, 0, 180, 48, 0x000000, 0.8)
      .setOrigin(0);

    // Texto do dinheiro
    const moneyText = this.add
      .text(10, 8, `R$ ${this.uiConfig.money}`, {
        fontSize: "26px",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0);

    // Container fixo na tela (não no mundo do jogo)
    this.uiMoney = this.add.container(20, 20, [moneyBg, moneyText]);
    
    // Configurações para fixar na tela
    this.uiMoney.setScrollFactor(0); // Não move com a câmera
    this.uiMoney.setDepth(10000); // Sempre na frente
    this.uiMoney.setScale(1); // Escala fixa independente do zoom

    // Salva referência ao texto para atualizações
    this.textoDinheiro = moneyText;
  }

  // HOOK METHODS

  setupHookControls() {
    this.input.keyboard.on("keydown-SPACE", () => {
      if (!this.hookConfig.hook) {
        this.throwHook();
        this.hookConfig.isSwinging = true;
        this.playerConfig.canMove = false;
        this.followHookWithCamera();
      } else if (this.hookConfig.isSwinging) {
        this.startHookThrow();
      }
    });
  }

  throwHook() {
    // Cria o anzol
    const hookStartPosition = {
      x: this.player.x,
      y: this.player.y - 80,
    };

    this.hookConfig.hook = this.add.image(
      hookStartPosition.x,
      hookStartPosition.y,
      "anzolplaceholder"
    );

    // Configuração inicial do anzol
    const hookScale = 0.03;
    this.hookConfig.hook.setScale(hookScale);
    this.hookConfig.hook.setOrigin(0.5, 0.5);

    // Armazena posição inicial para o retorno
    this.hookConfig.startX = hookStartPosition.x;
    this.hookConfig.startY = hookStartPosition.y;

    // Reseta estados do anzol
    this.hookConfig.gravity = false;
    this.hookConfig.returning = false;
  }

  startHookThrow() {
    // Calcula o ângulo em radianos (-90 para ajustar a direção inicial)
    const angleRad = Phaser.Math.DegToRad(this.hookConfig.hook.angle - 90);

    // Calcula as componentes de velocidade baseadas no ângulo
    this.hookConfig.velocityX = Math.cos(angleRad) * this.hookConfig.throwSpeed;
    this.hookConfig.velocityY = Math.sin(angleRad) * this.hookConfig.throwSpeed;

    // Atualiza estados do anzol
    this.hookConfig.isSwinging = false;
    this.hookConfig.gravity = true;

    // Configura a câmera para seguir o anzol
    this.cameras.main.startFollow(this.hookConfig.hook);
    this.tweens.add({
      targets: this.cameras.main,
      zoom: this.cameraConfig.hookZoom,
      duration: this.cameraConfig.tweenDuration,
      ease: "Power2",
    });
  }

  // TRASH METHODS

   spawnZoneWithDistanceCheck() {
    let attempts = 0;
    let validPosition = false;
    let x, y;

    // Tenta encontrar uma posição válida
    while (!validPosition && attempts < this.trashConfig.maxSpawnAttempts) {
      // Gera posição aleatória dentro da área de spawn
      x = Phaser.Math.Between(
        this.trashConfig.spawnArea.minX, 
        this.trashConfig.spawnArea.maxX
      );
      y = Phaser.Math.Between(
        this.trashConfig.spawnArea.minY, 
        this.trashConfig.spawnArea.maxY
      );

      // Verifica se está longe o suficiente do jogador
      const distanceToPlayer = Phaser.Math.Distance.Between(
        x, y, this.player.x, this.player.y
      );
      
      if (distanceToPlayer < 300) {
        attempts++;
        continue; // Muito perto do jogador, tenta outra posição
      }

      // Verifica distância com todas as zonas existentes
      validPosition = this.zonasDeLixo.every(zone => {
        const distance = Phaser.Math.Distance.Between(x, y, zone.x, zone.y);
        return distance >= this.trashConfig.minDistance;
      });

      attempts++;
    }

    // Se encontrou posição válida, spawna a zona
    if (validPosition) {
      this.spawnSingleZone(x, y);
      console.log(`Zona spawnada em (${x}, ${y}) após ${attempts} tentativas`);
    } else {
      console.warn(`Não foi possível encontrar posição válida após ${attempts} tentativas`);
    }
  }

  setupTrashZones() {
    // Criar N zonas iniciais usando spawnSingleZone
    for (let i = 0; i < this.trashConfig.targetZones; i++) {
      // tenta encontrar uma posição adequada evitando sobreposição
      this.spawnZoneWithDistanceCheck();
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
      } while (
        this.zonasDeLixo.some(
          (z) =>
            Phaser.Math.Distance.Between(z.x, z.y, x, y) <
            minDistanceBetweenZones
        ) &&
        attempts < 40
      );

      this.spawnSingleZone(x, y);
    }
  }

  spawnSingleZone(x, y) {
    // Grupo visual que contém sprites de lixo para representar "mancha" de lixo
    const zonaGroup = this.add.group();
    const positions = [];
    // Pelo menos 3 itens por zona (pode repetir tipos)
    const needed = Phaser.Math.Between(3, 5);
    // Gera posições dentro da zona evitando sobreposição
    for (let j = 0; j < needed; j++) {
      let px,
        py,
        posAttempts = 0;
      do {
        px = Phaser.Math.Between(-50, 50);
        py = Phaser.Math.Between(-30, 30);
        posAttempts++;
      } while (
        positions.some(
          (p) => Phaser.Math.Distance.Between(p.x, p.y, px, py) < 40
        ) &&
        posAttempts < 30
      );
      positions.push({ x: px, y: py });
    }

    for (let k = 0; k < positions.length; k++) {
      const tipo = Phaser.Math.RND.pick(this.trashConfig.types);
      const s = this.add.image(x + positions[k].x, y + positions[k].y, tipo);
      s.setScale(0.04);
      s.setAlpha(0.95);
      zonaGroup.add(s);
    }

    // Zona de colisão (invisível) - CORREÇÃO: usar origem no centro
    const zonaLixo = this.add.zone(x, y, 160, 120);
    zonaLixo.setOrigin(0.5, 0.5); // IMPORTANTE: definir origem no centro
    zonaLixo.x = x; // guardar posição para checagens futuras
    zonaLixo.y = y;
    zonaLixo.lixoGroup = zonaGroup;
    zonaLixo.coletas = 0; // Contador de coletas

    // Desenhar retângulo vermelho de debug e anexar para remoção posterior
    const g = this.add.graphics();
    g.lineStyle(2, 0xff0000);
    g.strokeRect(x - 80, y - 60, 160, 120);
    g.setDepth(100);
    zonaLixo.debugGraphics = g;

    this.zonasDeLixo.push(zonaLixo);
    return zonaLixo;
  }

  // UPDATE METHODS

  update(time, delta) {
    this.updatePlayer(delta);
    this.updateHook(delta);
    this.updateTrashZones(delta);
    this.updateUI(); // CORREÇÃO: Atualizar UI a cada frame
  }

  // CORREÇÃO: Novo método para atualizar a UI
  updateUI() {
    // Garantir que a UI sempre fique com escala fixa
    if (this.uiMoney) {
      this.uiMoney.setScale(1);
    }
  }

  updatePlayer(delta) {
    const deltaTime = delta / 1000; // Converte para segundos

    if (!this.playerConfig.canMove) return; // Usa playerConfig

    // Aceleração/desaceleração
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setFlipX(false);
      this.playerConfig.velocityX -= this.playerConfig.acceleration * deltaTime;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setFlipX(true);
      this.playerConfig.velocityX += this.playerConfig.acceleration * deltaTime;
    } else {
      // Desaceleração
      if (this.playerConfig.velocityX > 0) {
        this.playerConfig.velocityX = Math.max(
          0,
          this.playerConfig.velocityX -
            this.playerConfig.deceleration * deltaTime
        );
      } else if (this.playerConfig.velocityX < 0) {
        this.playerConfig.velocityX = Math.min(
          0,
          this.playerConfig.velocityX +
            this.playerConfig.deceleration * deltaTime
        );
      }
    }

    // Limita a velocidade máxima
    this.playerConfig.velocityX = Phaser.Math.Clamp(
      this.playerConfig.velocityX,
      -this.playerConfig.speed,
      this.playerConfig.speed
    );

    // Aplica o movimento
    this.player.x += this.playerConfig.velocityX * deltaTime;

    // Limita o movimento para não sair da tela
    const playerWidth = this.player.displayWidth;
    this.player.x = Phaser.Math.Clamp(
      this.player.x,
      playerWidth / 2,
      this.gameConfig.width - playerWidth / 2
    );
  }

  updateHook(delta) {
    if (!this.hookConfig.hook) return;

    const deltaSeconds = delta / 1000;

    if (this.hookConfig.isSwinging) {
      // Movimento pendular
      this.hookConfig.hook.angle +=
        this.hookConfig.swingSpeed *
        this.hookConfig.swingDirection *
        deltaSeconds;

      // Inverte a direção nos limites
      if (this.hookConfig.hook.angle >= 90) {
        this.hookConfig.hook.angle = 90;
        this.hookConfig.swingDirection = -1;
      } else if (this.hookConfig.hook.angle <= -90) {
        this.hookConfig.hook.angle = -90;
        this.hookConfig.swingDirection = 1;
      }
    } else if (this.hookConfig.gravity) {
      const angleRad = Phaser.Math.DegToRad(this.hookConfig.hook.angle - 90);
      const moveX = Math.cos(angleRad) * this.hookConfig.speed * deltaSeconds;
      const moveY = Math.sin(angleRad) * this.hookConfig.speed * deltaSeconds;

      if (!this.hookConfig.returning) {
        this.hookConfig.hook.x -= moveX;
        this.hookConfig.hook.y -= moveY;

        // CORREÇÃO: Verificação de colisão corrigida
        this.zonasDeLixo.forEach((zona) => {
          const zoneX = zona.x;
          const zoneY = zona.y;
          const zoneWidth = 160;
          const zoneHeight = 120;
          
          if (this.hookConfig.hook.x >= zoneX - zoneWidth/2 && 
              this.hookConfig.hook.x <= zoneX + zoneWidth/2 &&
              this.hookConfig.hook.y >= zoneY - zoneHeight/2 && 
              this.hookConfig.hook.y <= zoneY + zoneHeight/2) {
            this.coletarLixo(zona);
          }
        });

        // Checa se saiu da tela
        if (
          this.hookConfig.hook.y > this.gameConfig.height + 20 ||
          this.hookConfig.hook.y < -20 ||
          this.hookConfig.hook.x < -20 ||
          this.hookConfig.hook.x > this.gameConfig.width + 20
        ) {
          this.hookConfig.returning = true;
        }
      } else {
        // CORREÇÃO: Retorno para o player atual (não posição inicial)
        const targetX = this.player.x;
        const targetY = this.player.y - 80;
        const dx = targetX - this.hookConfig.hook.x;
        const dy = targetY - this.hookConfig.hook.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
          this.hookConfig.hook.destroy();
          this.hookConfig.hook = null;
          this.hookConfig.isSwinging = false;
          this.hookConfig.gravity = false;
          this.hookConfig.returning = false;
          this.playerConfig.canMove = true;
          this.resetCamera();
          return;
        }

        // Voltar na direção do player atual
        const dirX = dx / distance;
        const dirY = dy / distance;
        this.hookConfig.hook.x += dirX * this.hookConfig.speed * deltaSeconds;
        this.hookConfig.hook.y += dirY * this.hookConfig.speed * deltaSeconds;
      }
    }
  }

  updateTrashZones(delta) {
    this.trashConfig.respawnTimer += delta;
    if (this.trashConfig.respawnTimer >= this.trashConfig.respawnDelay) {
      this.trashConfig.respawnTimer = 0;
      while (this.zonasDeLixo.length < this.trashConfig.targetZones) {
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
        } while (
          this.zonasDeLixo.some(
            (z) =>
              Phaser.Math.Distance.Between(z.x, z.y, x, y) <
              minDistanceBetweenZones
          ) &&
          attempts < 50
        );

        this.spawnSingleZone(x, y);
      }
    }
  }

  resetCamera() {
    // Transição suave com tween
    this.tweens.add({
      targets: this.cameras.main,
      zoom: this.cameraConfig.defaultZoom,
      duration: this.cameraConfig.tweenDuration,
      ease: "Power2",
    });

    // Transição suave para seguir o player
    const cam = this.cameras.main;
    cam.startFollow(this.player);
  }

  followHookWithCamera() {
    this.cameras.main.startFollow(this.hookConfig.hook);
    this.tweens.add({
      targets: this.cameras.main,
      zoom: this.cameraConfig.hookZoom,
      duration: this.cameraConfig.tweenDuration,
      ease: "Power2",
    });
  }

  coletarLixo(zona) {
    // Incrementa contador de coletas desta zona
    zona.coletas = (zona.coletas || 0) + 1;

    // Escolher um tipo de lixo aleatório
    const lixoAleatorio = Phaser.Math.RND.pick(this.trashConfig.types);

    // Criar sprite do lixo na posição do anzol
    const lixo = this.add.image(
      this.hookConfig.hook.x,
      this.hookConfig.hook.y,
      lixoAleatorio
    );
    lixo.setScale(0.05);

    // Adicionar dinheiro
    const valorLixo = Phaser.Math.Between(10, 50);
    this.uiConfig.money += valorLixo;

    // Atualizar texto com o novo valor
    if (this.textoDinheiro) {
      this.textoDinheiro.setText(`R$ ${this.uiConfig.money}`);
    }

    // Animação do lixo subindo
    this.tweens.add({
      targets: lixo,
      y: this.hookConfig.hook.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        lixo.destroy();
      },
    });

    // Se coletou 3 vezes, remove a zona com efeito
    const REMOVER_APOS = 3;
    if (zona.coletas >= REMOVER_APOS) {
      if (zona.lixoGroup) {
        this.tweens.add({
          targets: zona.lixoGroup.getChildren(),
          alpha: 0,
          scale: 0,
          duration: 800,
          onComplete: () => {
            zona.lixoGroup.clear(true, true);
          },
        });
      }

      if (zona.debugGraphics) {
        zona.debugGraphics.destroy();
      }

      const idx = this.zonasDeLixo.indexOf(zona);
      if (idx > -1) {
        this.zonasDeLixo.splice(idx, 1);
      }
    }

    // Iniciar retorno do anzol
    this.hookConfig.returning = true;
  }
}