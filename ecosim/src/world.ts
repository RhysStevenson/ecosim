import * as PIXI from "pixi.js";
import { Creature } from "./creature.ts";
import { Food } from "./food.ts";

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
  populationText: PIXI.Text;
  populationHistory: number[] = [];
  historyLength = 3000; // number of frames to keep (e.g. ~5 seconds at 60fps)
  graph: PIXI.Graphics;

  constructor(stage: PIXI.Container, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cols = Math.ceil(width / this.cellSize);
    this.rows = Math.ceil(height / this.cellSize);
    this.grid = Array.from({ length: this.cols }, () =>
      Array.from({ length: this.rows }, () => []),
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
    for (let i = 0; i < 50; i++) {
      const c = new Creature(
        Math.random() * width,
        Math.random() * height,
        this.container,
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
      const f = new Food(
        Math.random() * width,
        Math.random() * height,
        this.foodContainer,
      );
      this.foods.push(f);
    }

    this.populationText = new PIXI.Text({
      text: "Population: 0",
      style: {
        fill: 0xffffff,
        fontSize: 14,
        fontFamily: "monospace",
      },
    });
    this.populationText.x = 10;
    this.populationText.y = 10;
    stage.addChild(this.populationText);

    this.graph = new PIXI.Graphics();
    this.graph.y = 40; // position below text
    stage.addChild(this.graph);

    const foodIntervalSlider = document.getElementById(
      "foodInterval",
    ) as HTMLInputElement;
    const foodIntervalValue = document.getElementById(
      "foodIntervalValue",
    ) as HTMLSpanElement;

    foodIntervalSlider.addEventListener("input", () => {
      this.foodSpawnInterval = parseFloat(foodIntervalSlider.value);
      foodIntervalValue.textContent = `${this.foodSpawnInterval.toFixed(2)}s`;
    });
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

    this.populationText.text = `Creatures: ${this.creatures.length} | Food: ${this.foods.length}`;

    // Record population history
    this.populationHistory.push(this.creatures.length);
    if (this.populationHistory.length > this.historyLength) {
      this.populationHistory.shift();
    }

    // --- Draw population graph ---
    const g = this.graph;
    g.clear();

    const graphWidth = 200;
    const graphHeight = 50;
    const x = 10;
    const y = 0;

    g.rect(x, y, graphWidth, graphHeight).fill({ color: 0x000000, alpha: 0.5 }); // background box

    // Compute scaling
    const maxPop = Math.max(...this.populationHistory, 10);
    const scaleX = graphWidth / this.historyLength;
    const scaleY = graphHeight / maxPop;

    // Draw line
    g.moveTo(x, y + graphHeight - this.populationHistory[0] * scaleY);
    for (let i = 1; i < this.populationHistory.length; i++) {
      const px = x + i * scaleX;
      const py = y + graphHeight - this.populationHistory[i] * scaleY;
      g.lineTo(px, py);
    }
    g.stroke({ color: 0x00ff00, width: 1 }); // bright green line
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
          this.foodContainer,
        );
        this.foods.push(f);
      }
    }
  }
}
