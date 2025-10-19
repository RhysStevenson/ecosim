import * as PIXI from 'pixi.js';
import { Food } from './food';
import { World } from './world';

export class Creature {
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number = 100;
  sprite: PIXI.Particle;

  constructor(x: number, y: number, container: PIXI.ParticleContainer) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;

    const gfx = PIXI.Texture.WHITE;
    this.sprite = new PIXI.Particle(gfx);
    this.sprite.scaleX = 3;
    this.sprite.scaleY = 3;
    this.sprite.tint = 0x00ff80 + Math.floor(Math.random() * 0x0040);
    this.sprite.anchorX = 0.5;
    this.sprite.anchorY = 0.5;
    this.sprite.x = x;
    this.sprite.y = y;
    container.addParticle(this.sprite);
  }

  update(dt: number, width: number, height: number, nearbyFood: Food[], world: World) {
    // find nearest food
    let closest: Food | null = null;
    let minDist = Infinity;

    for (const f of nearbyFood) {
      const dx = f.x - this.x;
      const dy = f.y - this.y;
      const dist = dx*dx + dy*dy; // squared distance
      if (dist < minDist) {
        minDist = dist;
        closest = f;
      }
    }

    // move toward food
    if (closest) {
      const dx = closest.x - this.x;
      const dy = closest.y - this.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      const speed = 50; // pixels per second
      this.vx = (dx/len) * speed;
      this.vy = (dy/len) * speed;

      // eat if close
      if (len < 5) {
        this.energy += 50;          // gain energy
        closest.consume()
        nearbyFood.splice(nearbyFood.indexOf(closest), 1);
      }
    }

    if (this.energy > 150) {
      this.energy /= 2; // split energy with offspring
      const child = new Creature(this.x + Math.random()*10-5, this.y + Math.random()*10-5, world.container);
      child.energy = this.energy;
      world.creatures.push(child);
    }


    // move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // bounce walls
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    // energy drain
    this.energy -= dt * 5;
    // if (this.energy <= 0) this.dead = true;
    if (this.energy <= 0) {
      world.container.removeParticle(this.sprite)
    }

    this.sprite.x = this.x;
    this.sprite.y = this.y
  }

}
