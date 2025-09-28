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
      height: 2000, // 768
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
      verticalScrollThreshold: 300, // Distância do player para começar a mover a câmera
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

    // MOSCAO
    this.shopConfig = {
      npc: null,
      isVisible: false,
      spawnDelay: 4000, // 4 segundo de delay para spawnar
      lastHookTime: 0, // Armazena quando o anzol foi usado pela última vez
      scale: 0.09,
      spawnDistance: 600, // Aumentado para garantir que fique fora da bound da câmera
    };
  }

  // PRELOAD
  preload() {
    this.load.image("ceubg", "assets/sprites/ceubg.png");
    this.load.image("barcoratosprite", "assets/sprites/barcoratosprite.png");
    this.load.image(
      "moscaoplaceholder",
      "assets/sprites/moscaoplaceholder.png"
    );
    this.load.image("garrafa", "assets/sprites/Garrafa.png");
    this.load.image("osso", "assets/sprites/Osso.png");
    this.load.image("plástico", "assets/sprites/plástico.png");
    this.load.image("saco", "assets/sprites/Saco.png");

    // RATO
    this.load.image("ratoMira", "assets/sprites/ratoMira.png");
    this.load.image("ratoMiraArpao", "assets/sprites/ratoMiraArpao.png");
    this.load.image("arpao", "assets/sprites/arpao.png");
    this.load.image("barcoSemFundo", "assets/sprites/barcoSemFundo.png");

    // ONDAS
    this.load.image("onda1", "assets/sprites/onda1.png");
    this.load.image("onda2", "assets/sprites/onda2.png");
  }

  // LOAD ASSETS
  loadAssets() {
    const assets = [
      { key: "ceubg", path: "assets/sprites/ceubg.png" },
      { key: "barcoratosprite", path: "assets/sprites/barcoratosprite.png" },
      {
        key: "moscaoplaceholder",
        path: "assets/sprites/moscaoplaceholder.png",
      },
      { key: "garrafa", path: "assets/sprites/Garrafa.png" },
      { key: "osso", path: "assets/sprites/Osso.png" },
      { key: "plástico", path: "assets/sprites/plástico.png" },
      { key: "saco", path: "assets/sprites/Saco.png" },

      { key: "ratoMira", path: "assets/sprites/ratoMira.png" },
      { key: "ratoMiraArpao", path: "assets/sprites/ratoMiraArpao.png" },
      { key: "arpao", path: "assets/sprites/arpao.png" },
      { key: "barcoSemFundo", path: "assets/sprites/barcoSemFundo.png" },

      { key: "onda1", path: "assets/sprites/onda1.png" },
      { key: "onda2", path: "assets/sprites/onda2.png" },
    ];

    assets.forEach((asset) => this.load.image(asset.key, asset.path));
  }

  create() {
    this.setupBackground();
    this.setupPlayer();
    this.setupOndas();
    this.setupInputs();
    this.setupCamera();
    this.setupTrashZones();
    this.setupMoneyUI();
    this.setupShopkeeper();
  }

  // SETUP METHODS

  setupBackground() {
    // Create a tiling sprite that stops at the original background height
    this.bg = this.add.tileSprite(
      this.gameConfig.width / 2,
      384, // Center of the original background area
      this.gameConfig.width,
      768 / 3, // Original background height
      "ceubg"
    );
    this.bg.setScrollFactor(1); // Slow parallax scroll
    this.bg.setDepth(0);
    this.bg.setOrigin(0.5, 0.5);

    // Fill the rest with a solid color
    this.waterBackground = this.add.rectangle(
      this.gameConfig.width / 2,
      (768 + this.gameConfig.height) / 2, // Center of the water area
      this.gameConfig.width,
      this.gameConfig.height - 768, // Remaining vertical space
      0x1e90ff // Deep blue for water
    );
    this.waterBackground.setScrollFactor(0.1); // Very slow scroll for water
    this.waterBackground.setDepth(-1);
  }

  setupPlayer() {
    this.player = this.add.image(
      this.gameConfig.width / 2,
      500,
      "barcoratosprite"
    );
    const scale = (this.gameConfig.width * 0.08) / this.player.width;
    this.player.setScale(scale).setOrigin(0.5, 0.8);
    this.player.setDepth(2);

    //   this.ratoSemArpao = this.add
    //     .image(this.barco.x, this.barco.y, "ratoMira")
    //     .setScale(0.04)
    //     .setOrigin(0.5, 0.5)
    //     .setVisible(false);
  }

  setupOndas() {
    this.onda1 = this.add.tileSprite(
      this.gameConfig.width / 2,
      this.player.y,
      this.gameConfig.width,
      700,
      "onda1"
    );
    this.onda1.setOrigin(0.5, 0.6); // 0.5 / 0.79
    this.onda1.setDepth(1); // atrás dos objetos, mas na frente do céu

    this.onda1.tilePositionX = 0;
    this.onda1.tilePositionY = 0;

    this.onda2 = this.add.tileSprite(
      this.gameConfig.width / 2,
      this.player.y,
      this.gameConfig.width,
      700,
      "onda2"
    );
    this.onda2.setOrigin(0.5, 0.6); // 0.5 / 0.74
    this.onda2.setDepth(9999); // sempre na frente

    this.onda2.tilePositionX = 0;
    this.onda2.tilePositionY = 0;
  }

  setupRatoSemArpao() {
    const ratoStartPosition = {
      x: this.player.x,
      y: this.player.y,
    };
    this.ratoSemArpao = this.add
      .image(ratoStartPosition.x + 25, ratoStartPosition.y + 10, "ratoMira")
      .setScale(0.05)
      .setOrigin(0.5, 0.5)
      .setVisible(true)
      .setDepth(3);
    return this.ratoSemArpao;
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
    cam.setDeadzone(100, 50);
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

  throwHook() {
    // Cria o anzol
    const hookStartPosition = {
      x: this.player.x,
      y: this.player.y,
    };

    this.hookConfig.hook = this.add
      .image(
        hookStartPosition.x + 35,
        hookStartPosition.y - 20,
        "ratoMiraArpao"
      )
      .setDepth(3);

    // Configuração inicial do anzol
    const hookScale = 0.05;
    this.hookConfig.hook.setScale(hookScale);
    this.hookConfig.hook.setOrigin(0.5, 0.01);

    // Armazena posição inicial para o retorno
    this.hookConfig.startX = hookStartPosition.x;
    this.hookConfig.startY = hookStartPosition.y;

    // Reseta estados do anzol
    this.hookConfig.gravity = false;
    this.hookConfig.returning = false;
  }

  setupHookControls() {
    this.input.keyboard.on("keydown-SPACE", () => {
      if (!this.hookConfig.hook) {
        this.player.setTexture("barcoSemFundo").setOrigin(0.5, 0.58);
        this.throwHook();
        this.hookConfig.isSwinging = true;
        this.playerConfig.canMove = false;
        this.followHookWithCamera();
      } else if (this.hookConfig.isSwinging) {
        this.startHookThrow();
      }
    });
  }

  startHookThrow() {
    const angleRad = Phaser.Math.DegToRad(this.hookConfig.hook.angle - 90);

    // velocidade fixa
    this.hookConfig.velocityX = Math.cos(angleRad) * this.hookConfig.throwSpeed;
    this.hookConfig.velocityY = Math.sin(angleRad) * this.hookConfig.throwSpeed;

    this.hookConfig.isSwinging = false;
    this.hookConfig.gravity = true;

    this.followHookWithCamera();
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

  // MOSCAO METHODS

  setupShopkeeper() {
    this.shopConfig.npc = this.add.image(0, 0, "moscaoplaceholder"); // Substituir pela sprite correta do lojista
    this.shopConfig.npc.setScale(this.shopConfig.scale);
    this.shopConfig.npc.setDepth(1);
    this.shopConfig.npc.setVisible(false);
  }

  // UPDATE METHODS

  update(time, delta) {
    this.updatePlayer(delta);
    this.updateHook(delta);
    this.updateTrashZones(delta);
    this.updateShopkeeper();
    this.updateOndas(time, delta);
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
      if (this.hookConfig.hook.angle >= 45) {
        this.hookConfig.hook.angle = 45;
        this.hookConfig.swingDirection = -1;
      } else if (this.hookConfig.hook.angle <= -45) {
        this.hookConfig.hook.angle = -45;
        this.hookConfig.swingDirection = 1;
      }
    } else if (this.hookConfig.gravity) {
      const angleRad = Phaser.Math.DegToRad(this.hookConfig.hook.angle - 90);
      const moveX = Math.cos(angleRad) * this.hookConfig.speed * deltaSeconds;
      const moveY = Math.sin(angleRad) * this.hookConfig.speed * deltaSeconds;

      if (!this.rato) {
        this.rato = this.setupRatoSemArpao();
        this.rato.angle = this.hookConfig.hook.angle;
        this.rato.setOrigin(0.5, 0.5);
      }

      this.hookConfig.hook.setTexture("arpao");

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


        if (distance < 5) {
          // Perto o suficiente da posição inicial
          this.hookConfig.hook.destroy(); // Remove o anzol
          console.log("Anzol retornou e foi removido");
          if (this.rato) {
            this.rato.destroy();
            this.rato = null;
          }
          this.hookConfig.hook = null;
          this.hookConfig.isSwinging = false;
          this.hookConfig.gravity = false;
          this.hookConfig.returning = false;
          this.playerConfig.canMove = true; // Permite o movimento do player
          this.player.setTexture("barcoratosprite").setOrigin(0.5, 0.8);
          this.resetCamera(); // Reset camera to follow player
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
    const cam = this.cameras.main;

    // Volta a seguir o player suavemente
    cam.startFollow(this.player, true, 0.05, 0.05);

    // Zoom suave de volta
    this.tweens.add({
      targets: cam,
      zoom: this.cameraConfig.defaultZoom,
      duration: this.cameraConfig.tweenDuration,
      ease: "Power2",
    });
  }

  updateShopkeeper() {
    const currentTime = this.time.now;
    const currentZoom = this.cameras.main.zoom;
    const isDefaultZoom =
      Math.abs(currentZoom - this.cameraConfig.defaultZoom) < 0.1;

    // Se o anzol está sendo usado, atualiza o tempo e esconde o moscão
    if (this.hookConfig.isSwinging || this.hookConfig.hook) {
      this.shopConfig.lastHookTime = currentTime;
      if (this.shopConfig.npc && this.shopConfig.isVisible) {
        this.shopConfig.npc.setVisible(false);
        this.shopConfig.isVisible = false;
      }
      return;
    }

    // Verifica se já passou o delay após o uso do anzol
    const hasDelayPassed =
      currentTime - this.shopConfig.lastHookTime > this.shopConfig.spawnDelay;

    // Tenta spawnar apenas se estiver no zoom padrão, passou o delay e o lojista não está visível
    if (!this.shopConfig.isVisible && isDefaultZoom && hasDelayPassed) {
      this.spawnShopkeeper();
    }
  }

  followHookWithCamera() {
    const cam = this.cameras.main;

    // Começa a seguir o hook suavemente
    cam.startFollow(this.hookConfig.hook, true, 0.05, 0.05);

    // Faz o zoom suave ao mesmo tempo
    this.tweens.add({
      targets: cam,
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

  spawnShopkeeper() {
    if (!this.shopConfig.npc) return;

    // Calcula a viewport da câmera
    const cam = this.cameras.main;
    const viewportLeft = this.player.x - cam.width / (2 * cam.zoom);
    const viewportRight = this.player.x + cam.width / (2 * cam.zoom);

    // Decide o lado para spawnar (esquerda ou direita)
    const spawnLeft = Phaser.Math.RND.pick([true, false]);
    let spawnX;

    if (spawnLeft) {
      spawnX = this.player.x - this.shopConfig.spawnDistance;
      this.shopConfig.npc.setFlipX(true);
    } else {
      spawnX = this.player.x + this.shopConfig.spawnDistance;
      this.shopConfig.npc.setFlipX(false);
    }

    // Se o spawn estiver fora da tela jogável, inverte o lado
    if (spawnX < 0) {
      spawnX = this.player.x + this.shopConfig.spawnDistance;
      this.shopConfig.npc.setFlipX(false);
    } else if (spawnX > this.gameConfig.width) {
      spawnX = this.player.x - this.shopConfig.spawnDistance;
      this.shopConfig.npc.setFlipX(true);
    }

    // Define a posição Y igual ao player e usa a mesma origem
    this.shopConfig.npc.setOrigin(0.5, 0.6); // Mesma origem do player
    const spawnY = this.player.y;

    // Posiciona e mostra o lojista
    this.shopConfig.npc.setPosition(spawnX, spawnY);
    this.shopConfig.npc.setVisible(true);
    this.shopConfig.isVisible = true;
  }

  updateOndas(time, delta) {
    // Movimento das ondas com valores mais altos
    this.onda1.tilePositionX += 1; // Direita
    this.onda2.tilePositionX -= 2; // Esquerda

    // Efeito sinusoidal de sobe/desce CORRIGIDO
    // Use time * 0.001 para um movimento mais suave
    const waveTime = time * 0.001;

    // Posição Y base + movimento sinusoidal
    this.onda1.y = this.player.y + Math.sin(waveTime) * 9; // Movimento suave
    this.onda2.y = this.player.y + Math.cos(waveTime) * 4;
  }
}
