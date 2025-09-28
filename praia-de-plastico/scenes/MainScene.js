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
      height: 1300, // 768
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
      defaultZoom: 1.5,
      hookZoom: 1.0,
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
      minDistance: 220,
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
    spawnDelay: 4000,
    lastHookTime: 0,
    scale: 0.09,
    spawnDistance: 600,
    interactionRange: 80, 
    interactionText: null,
    };

    // UPGRADES

   this.shopUpgrades = {
  estrela: {
    cost: 100,
    unlocked: false,     // se o player comprou
    active: false,       // se tá ligado nesse lançamento
    usedThisLaunch: false, // se já foi usado nesse disparo
    effect: () => {
      this.shopUpgrades.estrela.active = true;
      this.shopUpgrades.estrela.usedThisLaunch = false;
    }
  }
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
    this.load.image("ratoIdle", "assets/sprites/ratoIdle.png");

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
      { key: "ratoIdle", path: "assets/sprites/ratoIdle.png" },

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
    this.trashCollected = 0;
    this.trashGoal = 1; // quantas zonas completas para abrir o popup, 1 pois debug
    this.popupShown = false; // evita abrir popup várias vezes
    this.popupActive = false; // bloqueia entradas enquanto o popup estiver ativo
  }

  // SETUP METHODS

  setupBackground() {
    // Create a tiling sprite that stops at the original background height
    this.bg = this.add.tileSprite(
      this.gameConfig.width / 2,
      384, // Center of the original background area
      this.gameConfig.width,
      768 / 3 + 150, // Original background height
      "ceubg"
    );
    this.bg.setScrollFactor(1); // Slow parallax scroll
    this.bg.setDepth(-4);
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
      569,
      "barcoSemFundo"
    );

    this.ratoIdle = this.add
      .image(this.player.x + 25, this.player.y + 10, "ratoIdle")
      .setScale(0.09)
      .setDepth(3);

    const scale = (this.gameConfig.width * 0.25) / this.player.width;
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
    this.onda1.setDepth(-1); // atrás dos objetos, mas na frente do céu

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
    this.onda2.setDepth(2); // sempre na frente

    this.onda2.tilePositionX = 0;
    this.onda2.tilePositionY = 0;
  }

  setupRatoSemArpao() {
    const ratoStartPosition = {
      x: this.ratoIdle.x,
      y: this.ratoIdle.y,
    };
    this.ratoSemArpao = this.add
      .image(ratoStartPosition.x, ratoStartPosition.y, "ratoMira")
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
  this.textoDinheiro = this.add.text(this.player.x - 324, this.player.y - 401, "R$ 0", {
    fontSize: "32px",
    fill: "#000000ff",
    fontStyle: "bold",
  });

  this.textoDinheiro.setOrigin(1, 0); // origem no canto superior direito

  // fixa na tela
  this.textoDinheiro.setScrollFactor(0);

  // garante que tá na frente
  this.textoDinheiro.setDepth(9999);

  console.log("UI criada:", this.textoDinheiro);
  console.log(this.textoDinheiro.x, this.textoDinheiro.y, this.textoDinheiro.depth);
}

  // HOOK METHODS

  throwHook() {
  if (this.shopUpgrades.estrela.unlocked) {
    this.shopUpgrades.estrela.effect(); // ativa o upgrade nesse disparo
    this.shopUpgrades.estrela.unlocked = false; // ⚡ reseta, tem que comprar de novo
  }
    const hookStartPosition = {
      x: this.player.x + 10,
      y: this.player.y - 10,
    };

    this.hookConfig.hook = this.add
      .image(hookStartPosition.x, hookStartPosition.y, "ratoMiraArpao")
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
        this.ratoIdle.setVisible(false);
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

setupTrashZones() {
  // Aumenta a quantidade de zonas
  const totalZonas = 12; // por exemplo, 12 zonas
  for (let i = 0; i < totalZonas; i++) {
    let attempts = 0;
    const minDistanceBetweenZones = 220;
    let x, y, profundidade;

    do {
      // Posição X aleatória em torno do player
      const offsetX = Phaser.Math.Between(-500, 500);
      x = Phaser.Math.Clamp(this.player.x + offsetX, 60, 1366 - 60);

      // Escolhe profundidade aleatória
      profundidade = Phaser.Math.RND.pick([1, 2, 3]); // 1 rasa, 2 média, 3 profunda

      // Y baseado na profundidade
      const minY = this.player.y + 150 + (profundidade - 1) * 120;
      const maxY = this.player.y + 300 + (profundidade - 1) * 120;
      y = Phaser.Math.Between(minY, maxY);
      y = Phaser.Math.Clamp(y, 200, this.gameConfig.height - 100);

      attempts++;
    } while (
      this.zonasDeLixo.some(
        (z) => Phaser.Math.Distance.Between(z.x, z.y, x, y) < minDistanceBetweenZones
      ) && attempts < 40
    );

    this.spawnSingleZone(x, y, profundidade);
  }
}

spawnSingleZone(x, y, profundidade = 1) {
  const zonaGroup = this.add.group();
  const positions = [];
  const needed = Phaser.Math.Between(3, 3);

  for (let j = 0; j < needed; j++) {
    let px, py, posAttempts = 0;
    do {
      px = Phaser.Math.Between(-50, 50);
      py = Phaser.Math.Between(-30, 30);
      posAttempts++;
    } while (
      positions.some((p) => Phaser.Math.Distance.Between(p.x, p.y, px, py) < 40) &&
      posAttempts < 30
    );
    positions.push({ x: px, y: py });
  }

  for (let k = 0; k < positions.length; k++) {
    const tipo = Phaser.Math.RND.pick(this.trashConfig.types);
    const s = this.add.image(x + positions[k].x, y + positions[k].y, tipo);
    s.setScale(0.04);
    s.setAlpha(0.95);
    s.setDepth(10);
    zonaGroup.add(s);
  }

  const zonaLixo = this.add.zone(x, y, 160, 120);
  zonaLixo.x = x;
  zonaLixo.y = y;
  zonaLixo.profundidade = profundidade; // salva a profundidade
  zonaLixo.lixoGroup = zonaGroup;
  zonaLixo.coletas = 0;

  if (this.physics && this.physics.world && this.physics.world.enable) {
    this.physics.world.enable(zonaLixo);
    if (zonaLixo.body) {
      zonaLixo.body.setAllowGravity(false);
      zonaLixo.body.setImmovable(true);
    }
  }

  // Debug gráfico opcional
  const g = this.add.graphics();
  g.lineStyle(2, profundidade === 1 ? 0x00ff00 : profundidade === 2 ? 0xffff00 : 0xff0000);
  g.strokeRect(x - 80, y - 60, 160, 120);
  g.setDepth(9999);
  zonaLixo.debugGraphics = g;

  this.zonasDeLixo.push(zonaLixo);
  return zonaLixo;
}


  // (This duplicate block has been removed to fix syntax errors)

  createPopup() {
    const popup = this.add.container(this.player.x, this.player.y); // centro (1366x768 / 2)
    popup.setDepth(9999);

    const bg = this.add.rectangle(0, 0, 600, 300, 0x000000, 0.8);
    bg.setStrokeStyle(3, 0xffffff);

    const texto = this.add
      .text(
        0,
        -60,
        "VITÓRIA!\n" +
          "Muito obrigado por jogar a demo de Praia de plástico,\n" +
          "lembre-se de sempre deixar os oceanos mais limpos.",
        {
          fontSize: "20px",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 550 },
        }
      )
      .setOrigin(0.5);

    const botaoOk = this.add
      .text(0, 40, "OK", {
        fontSize: "28px",
        color: "#00ff00",
        backgroundColor: "#003300",
        padding: 10,
      })
      .setOrigin(0.5)
      .setInteractive();

    const botaoCreditos = this.add
      .text(0, botaoOk.y + 60, "Créditos", {
        fontSize: "28px",
        color: "#d8d8d8ff",
        backgroundColor: "#313131ff",
        padding: 10,
      })
      .setOrigin(0.5)
      .setInteractive();

    botaoOk.on("pointerdown", () => {
      popup.destroy(); // fecha popup
    });

    botaoCreditos.on("pointerdown", () => {
      window.open("./scenes/CreditsScene.js");
    });

    popup.add([bg, texto, botaoOk, botaoCreditos]);
  }

  // MOSCAO METHODS

  setupShopkeeper() {
    this.shopConfig.npc = this.add.image(0, 0, "moscaoplaceholder");
    this.shopConfig.npc.setScale(this.shopConfig.scale);
    this.shopConfig.npc.setDepth(1);
    this.shopConfig.npc.setVisible(false);

    // Texto de interação, inicialmente invisível
    this.shopConfig.interactionText = this.add
    .text(0, 0, "Pressione E para interagir", {
      fontSize: "24px",
      fill: "#ffffff",
      backgroundColor: "#000000aa",
      padding: { x: 8, y: 4 },
    })
    .setOrigin(0.5)
    .setDepth(9999)
    .setVisible(false);
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
    const playerStartPosition = {
      x: this.player.x,
      y: this.player.y,
    };

    this.ratoIdle.setPosition(playerStartPosition.x - 3, playerStartPosition.y);

    const deltaTime = delta / 1000; // Converte para segundos

    if (!this.playerConfig.canMove) return; // Usa playerConfig

    // Aceleração/desaceleração
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setFlipX(true);
      this.ratoIdle.setFlipX(false);
      this.playerConfig.velocityX -= this.playerConfig.acceleration * deltaTime;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setFlipX(false);
      this.ratoIdle.setFlipX(true);
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

      // Checa colisão com todas as zonas
      if (this.zonasDeLixo.length > 0) {
        this.zonasDeLixo.forEach((zona) => {
          const bounds = zona.getBounds();
          if (Phaser.Geom.Rectangle.Contains(bounds, this.hookConfig.hook.x, this.hookConfig.hook.y)) {
            this.coletarLixo(zona, this.shopUpgrades.estrela.active);
          }
        });
      }

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
      // Retorno do anzol
      const dx = this.hookConfig.startX - this.hookConfig.hook.x;
      const dy = this.hookConfig.startY - this.hookConfig.hook.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        this.hookConfig.hook.destroy();
        if (this.rato) { this.rato.destroy(); this.rato = null; }
        this.hookConfig.hook = null;
        this.hookConfig.isSwinging = false;
        this.hookConfig.gravity = false;
        this.hookConfig.returning = false;
        this.playerConfig.canMove = true;
        this.ratoIdle.setVisible(true);
        this.resetCamera();
      } else {
        const dirX = dx / distance;
        const dirY = dy / distance;
        this.hookConfig.hook.x += dirX * this.hookConfig.speed * deltaSeconds;
        this.hookConfig.hook.y += dirY * this.hookConfig.speed * deltaSeconds;
      }
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
    const npc = this.shopConfig.npc;

    // Checa se o NPC ainda não está visível para spawnar
    if (!npc) return;

    if (!this.shopConfig.isVisible) {
        // Se ainda não está visível, spawn
        this.spawnShopkeeper();
        return; // Sai do update desse frame, só começa a checar interação no próximo
    }

    // Distância entre jogador e NPC
    const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y
    );

    if (distance <= this.shopConfig.interactionRange) {
        // Mostra o texto
        this.shopConfig.interactionText.setPosition(npc.x, npc.y - 60);
        this.shopConfig.interactionText.setVisible(true);

        // Tecla E
        if (!this.keyE) 
            this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
            this.openShopMenu();
        }
    } else {
        this.shopConfig.interactionText.setVisible(false);
    }
}

openShopMenu() {
  if (this.popupActive) return;
  this.popupActive = true;

  const menu = this.add.container(this.player.x, this.player.y - 50).setDepth(10000);

  const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.9);
  bg.setStrokeStyle(3, 0xffffff);

  const title = this.add.text(0, -120, "MENU DE UPGRADES", {
    fontSize: "28px",
    color: "#ffffff",
    fontStyle: "bold",
  }).setOrigin(0.5);

  // Botões de upgrade (por enquanto só placeholders)
  const upgrade1 = this.add.text(0, -40, `Estrela (R$ ${this.shopUpgrades.estrela.cost})`, { fontSize: "24px", color: "#00ff00" })
  .setOrigin(0.5)
  .setInteractive()
  .on("pointerdown", () => {
    if (!this.shopUpgrades.estrela.unlocked && this.uiConfig.money >= this.shopUpgrades.estrela.cost) {
        this.uiConfig.money -= this.shopUpgrades.estrela.cost;
        this.shopUpgrades.estrela.unlocked = true;  // compra concluída
        console.log("Upgrade Estrela comprado! Será usado no próximo lançamento.");
        if (this.textoDinheiro) this.textoDinheiro.setText(`R$ ${this.uiConfig.money}`);
    }
  });
  const upgrade2 = this.add.text(0, 20, "Upgrade 2", { fontSize: "24px", color: "#00ff00" }).setOrigin(0.5);
  const upgrade3 = this.add.text(0, 80, "Upgrade 3", { fontSize: "24px", color: "#00ff00" }).setOrigin(0.5);

  // Botão de fechar
  const closeBtn = this.add.text(0, 140, "FECHAR", { fontSize: "24px", color: "#ffffffff", backgroundColor: "#000000" })
    .setOrigin(0.5)
    .setInteractive()
    .on("pointerdown", () => {
      menu.destroy();
      this.popupActive = false;
    });

  menu.add([bg, title, upgrade1, upgrade2, upgrade3, closeBtn]);

  
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
  if (!zona || zona._processing) return; 
  zona._processing = true;

  zona.coletas = (zona.coletas || 0) + 1;
  const lixoSprites = zona.lixoGroup.getChildren();

  if (this.shopUpgrades.estrela.active) {
    // Se a estrela está ativa, pega 1 lixo de todas as zonas que o anzol atravessa
    if (lixoSprites.length > 0) {
        const idx = Phaser.Math.Between(0, lixoSprites.length - 1);
        this.criarLixoNoHook(lixoSprites[idx]);
        zona.lixoGroup.remove(lixoSprites[idx], true, true);
    }

    // Desativa a estrela depois do uso
    this.shopUpgrades.estrela.active = false;
    this.shopUpgrades.estrela.unlocked = false; // precisa comprar de novo
    console.log("Estrela usada, compre novamente para usar de novo!");
  } else {
    // Sem estrela: pega só 1 lixo normalmente
    if (lixoSprites.length > 0) {
        const idx = Phaser.Math.Between(0, lixoSprites.length - 1);
        this.criarLixoNoHook(lixoSprites[idx]);
        zona.lixoGroup.remove(lixoSprites[idx], true, true);
    }
  }

  // Adiciona dinheiro baseado na profundidade
  let valorLixo = Phaser.Math.Between(10, 50);
  if (zona.profundidade === 2) valorLixo *= 1.5;
  else if (zona.profundidade === 3) valorLixo *= 2;

  this.uiConfig.money += Math.floor(valorLixo);
  if (this.textoDinheiro) this.textoDinheiro.setText(`R$ ${this.uiConfig.money}`);

  const REMOVER_APOS = 3;
  if (zona.coletas >= REMOVER_APOS) {
    if (zona.lixoGroup) {
      this.tweens.add({
        targets: zona.lixoGroup.getChildren(),
        alpha: 0,
        scale: 0,
        duration: 800,
        onComplete: () => zona.lixoGroup.clear(true, true),
      });
    }
    if (zona.debugGraphics) zona.debugGraphics.destroy();
    const idx = this.zonasDeLixo.indexOf(zona);
    if (idx > -1) this.zonasDeLixo.splice(idx, 1);
    if (zona.destroy) zona.destroy();

    this.trashCollected = (this.trashCollected || 0) + 1;
    if (!this.popupShown && this.trashCollected >= this.trashGoal) {
      this.popupShown = true;
      this.createPopup();
    }
  } else {
    this.time.delayedCall(250, () => {
      zona._processing = false;
    }, [], this);
  }

  this.hookConfig.returning = true;
}

// Função auxiliar para criar o lixo visual no hook
criarLixoNoHook(sprite) {
  const lixo = this.add.image(this.hookConfig.hook.x, this.hookConfig.hook.y, sprite.texture.key)
    .setScale(0.05).setDepth(10);

  this.tweens.add({
    targets: lixo,
    y: this.hookConfig.hook.y - 50,
    alpha: 0,
    duration: 800,
    onComplete: () => lixo.destroy(),
  });
}

  // MOSCAO SPAWN
  spawnShopkeeper() {
    if (!this.shopConfig.npc) return;

    const npc = this.shopConfig.npc;

    // Largura real do NPC considerando a escala
    const npcWidth = npc.width * npc.scaleX;

    // Limites visíveis da tela (0 a gameConfig.width)
    const minX = npcWidth * npc.originX;
    const maxX = this.gameConfig.width - npcWidth * (1 - npc.originX);

    // Deslocamento para a direita
    const rightOffset = 100; // aumenta para spawnar mais à direita

    // Limites seguros para spawn
    let leftLimit = Math.max(minX, this.player.x + rightOffset); // player + offset
    let rightLimit = Math.min(maxX, this.player.x + this.shopConfig.spawnDistance);

    // Escolhe posição aleatória dentro dessa faixa
    let spawnX = Phaser.Math.Between(leftLimit, rightLimit);

    // Decide flipX dependendo se está à esquerda ou direita do player
    npc.setFlipX(spawnX < this.player.x);

    // Altura igual ao player
    const spawnY = this.player.y;

    npc.setOrigin(0.5, 0.6);
    npc.setPosition(spawnX, spawnY);
    npc.setVisible(true);
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