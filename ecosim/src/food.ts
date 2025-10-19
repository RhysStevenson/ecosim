import * as PIXI from "pixi.js";

export class Food {
  x: number;
  y: number;
  sprite: PIXI.Particle;
  container: PIXI.ParticleContainer;

  constructor(x: number, y: number, container: PIXI.ParticleContainer) {
    this.x = x;
    this.y = y;
    this.container = container;

    const texture = PIXI.Texture.WHITE; // simple square
    this.sprite = new PIXI.Particle(texture);
    this.sprite.scaleX = 4;
    this.sprite.scaleY = 4;
    this.sprite.tint = 0x00ff00;
    this.sprite.anchorX = 0.5;
    this.sprite.anchorY = 0.5;

    this.sprite.x = x;
    this.sprite.y = y;

    this.container.addParticle(this.sprite);
  }

  consume() {
    this.container.removeParticle(this.sprite);
  }
}
