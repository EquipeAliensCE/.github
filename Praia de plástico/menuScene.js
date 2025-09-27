const { Physics } = require("phaser");

const size={
width:500,
heigth:500,
}

const speedDown =300

const config = {
  type: Phaser.WEBGL,
  width: size.width,
  heigth: size.heigth,
  //Quando for precisar puxar um arquivo do HTML, faça como se fosse JS e HTML normal usando o document.getElementeById.
  canvas: document.getElementById('gameCanvas'),
  backgroundColor: '#0d0d35',
  scene: {
    create: function () {
      this.add.text(100, 200, 'Funcionou!', { fontSize: '32px', fill: '#fff' });
    }
  },
  physics:{
      default:"arcade",
      arcade:{
        gravity:{y:speedDown},
        debug:true
      }
  }
};

const game = new Phaser.Game(config)