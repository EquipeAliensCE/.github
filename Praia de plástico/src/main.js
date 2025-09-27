import './style.css'
import Phaser from 'phaser'

const size={
 width:500,
 height:500,
}

const config = {
  type:Phaser.WEBGL,
  width:size.width,
  height:size.height,
  canvas:gameCanvas
}

const game = new Phaser.Game(config)