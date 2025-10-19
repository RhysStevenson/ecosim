import * as PIXI from 'pixi.js';
import { Food } from './food';
import { World } from './world';

export class Creature {
  x: number;
  y: number;
  vx: number;
  vy: number;
  wanderAngle: number;
  dead: boolean = false;
  energy: number = 100;
  sprite: PIXI.Particle;

  constructor(x: number, y: number, container: PIXI.ParticleContainer) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.wanderAngle = (Math.random())

    const gfx = PIXI.Texture.WHITE;
    this.sprite = new PIXI.Particle(gfx);
    this.sprite.scaleX = 3;
    this.sprite.scaleY = 3;
    // this.sprite.tint = 0x00ff80 + Math.floor(Math.random() * 0x0040);
    this.sprite.tint = 0xFF4B00
    this.sprite.anchorX = 0.5;
    this.sprite.anchorY = 0.5;
    this.sprite.x = x;
    this.sprite.y = y;
    container.addParticle(this.sprite);
  }

  update(dt: number, width: number, height: number, food: Food[], world: World) {
    const visionRadius = 100; // pixels
    const wanderSpeed = 20;   // slower than food speed

    // --- Find nearest food within visionRadius ---
    let closest: Food | null = null;
    let minDistSq = visionRadius * visionRadius;

    for (const f of food) {
      const dx = f.x - this.x;
      const dy = f.y - this.y;
      const distSq = dx*dx + dy*dy;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        closest = f;
      }
    }

    // --- Movement ---
    if (closest) {
      // Move towards food
      const dx = closest.x - this.x;
      const dy = closest.y - this.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      const speed = 50; // pixels per second

      this.vx = (dx / len) * speed;
      this.vy = (dy / len) * speed;

      // Eat if close
      if (len < 5) {
        this.energy += 50;          
        closest.consume();          // remove food sprite
        food.splice(food.indexOf(closest), 1);
      }
    } else {
      // No nearby food → wander
      if (!this.wanderAngle) this.wanderAngle = Math.random() * Math.PI * 2;

      // Slight random walk
      this.wanderAngle += (Math.random() - 0.5) * 0.3;
      this.vx = Math.cos(this.wanderAngle) * wanderSpeed;
      this.vy = Math.sin(this.wanderAngle) * wanderSpeed;
    }

    // --- Reproduction ---
    if (this.energy > 150) {
      this.energy /= 2;

      // Offset offspring direction randomly
      const offsetAngle = Math.random() * Math.PI * 2;
      const child = new Creature(
        this.x + Math.cos(offsetAngle) * 5,
        this.y + Math.sin(offsetAngle) * 5,
        world.container
      );
      child.energy = this.energy;
      child.wanderAngle = offsetAngle; // give child a wander direction
      world.creatures.push(child);

      // --- Visual flair: simple pink pop ---
      const effect = new PIXI.Particle(PIXI.Texture.WHITE);
      effect.scaleX = 5;
      effect.scaleY = 5;
      effect.tint = 0xff69b4; // pink
      effect.anchorX = 0.5;
      effect.anchorY = 0.5;
      effect.x = this.x;
      effect.y = this.y;
      world.container.addParticle(effect);

      // Store effect in world for lifetime management
      if (!world.effects) world.effects = [];
      world.effects.push({ sprite: effect, lifetime: 0.3 }); // 0.3s fade
    }

    // --- Move ---
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // --- Bounce walls ---
    if (this.x < 0) { this.x = 0; this.vx *= -1; }
    if (this.x > width) { this.x = width; this.vx *= -1; }
    if (this.y < 0) { this.y = 0; this.vy *= -1; }
    if (this.y > height) { this.y = height; this.vy *= -1; }

    // --- Energy drain & death ---
    this.energy -= dt * 5;
    if (this.energy <= 0) {
      this.dead = true;

      // --- Visual flair: simple grey pop ---
      const effect = new PIXI.Particle(PIXI.Texture.WHITE);
      effect.scaleX = 5;
      effect.scaleY = 5;
      effect.tint = 0x898989; // grey
      effect.anchorX = 0.5;
      effect.anchorY = 0.5;
      effect.x = this.x;
      effect.y = this.y;
      world.container.addParticle(effect);

      // Store effect in world for lifetime management
      if (!world.effects) world.effects = [];
      world.effects.push({ sprite: effect, lifetime: 0.3 }); // 0.3s fade
    }

    // --- Update sprite ---
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}
