const config = {
  type: Phaser.WEBGL,
  width: 500,
  height: 500,
  canvas: document.getElementById('gameCanvas'),
  backgroundColor: '#0d0d35',
  scene: {
    create: function () {
      this.add.text(100, 200, 'Funcionou!', { fontSize: '32px', fill: '#fff' });
    }
  }
};

new Phaser.Game(config);

console.log("Phaser versão:", Phaser.AUTO);