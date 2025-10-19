import * as PIXI from 'pixi.js';
import { Creature } from './creature.ts';
import { Food } from './food.ts';

type Effect = {
  sprite: PIXI.Particle;
  lifetime: number;
};

export class World {
  width: number;
  height: number;
  cellSize = 50;
  cols: number;
  rows: number;
  grid: Creature[][][];
  creatures: Creature[] = [];
  foods: Food[] = [];
  container: PIXI.ParticleContainer;
  foodContainer: PIXI.ParticleContainer;
  foodSpawnTimer: number = 0; // seconds accumulator
  foodSpawnInterval: number = 0.1; // spawn every 1 second (adjustable)
  effects: Effect[] = [];

  constructor(stage: PIXI.Container, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cols = Math.ceil(width / this.cellSize);
    this.rows = Math.ceil(height / this.cellSize);
    this.grid = Array.from({ length: this.cols }, () =>
      Array.from({ length: this.rows }, () => [])
    );

    // particle container for fast sprite batching
    this.container = new PIXI.ParticleContainer({
        dynamicProperties: {
            position: true, // default
            vertex: false,
            rotation: false,
            color: false,
        },
    });
    stage.addChild(this.container);

    // spawn some creatures
    for (let i = 0; i < 100; i++) {
      const c = new Creature(
        Math.random() * width,
        Math.random() * height,
        this.container
      );
      this.creatures.push(c);
    }

    this.foodContainer = new PIXI.ParticleContainer({
        dynamicProperties: {
            position: true, // default
            vertex: false,
            rotation: false,
            color: false,
        },
    });
    stage.addChild(this.foodContainer);

    this.foods = [];
    // Spawn some food randomly
    for (let i = 0; i < 200; i++) {
        const f = new Food(Math.random() * width, Math.random() * height, this.foodContainer);
        this.foods.push(f);
    }

  }

  clearGrid() {
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.grid[x][y].length = 0;
      }
    }
  }

  insertToGrid(c: Creature) {
    const gx = Math.floor(c.x / this.cellSize);
    const gy = Math.floor(c.y / this.cellSize);
    if (gx >= 0 && gy >= 0 && gx < this.cols && gy < this.rows) {
      this.grid[gx][gy].push(c);
    }
  }

  update(dt: number) {
    this.clearGrid();
    console.log(this.creatures.length)
    this._update_creatures(dt);

    this._spawn_food(dt);

    // Update temporary pink pops
    if (this.effects) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
        const e = this.effects[i];
        e.lifetime -= dt;
        e.sprite.alpha = Math.max(e.lifetime / 0.3, 0);
        if (e.lifetime <= 0) {
        this.effects.splice(i, 1);
        }
    }
    }
  }

  _update_creatures(dt: number) {
    for (let i = this.creatures.length - 1; i >= 0; i--) {
        const creature = this.creatures[i];
        creature.update(dt, this.width, this.height, this.foods, this);
        if (creature.dead) {
            this.container.removeParticle(creature.sprite);
            this.creatures.splice(i, 1);
        } else {
            this.insertToGrid(creature);
        }
    }
  }

  _spawn_food(dt: number) {
    this.foodSpawnTimer += dt;
    while (this.foodSpawnTimer >= this.foodSpawnInterval) {
        this.foodSpawnTimer -= this.foodSpawnInterval;

        // Spawn a new food at random position
        if (this.foods.length < 5000) {
            const f = new Food(
                Math.random() * this.width,
                Math.random() * this.height,
                this.foodContainer
            );
            this.foods.push(f);
        }
    }
  }
}
