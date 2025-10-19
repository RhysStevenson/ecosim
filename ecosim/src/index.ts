import { Application } from "pixi.js";
import { World } from './world.ts';

const app = new Application();
await app.init({
  width: 1200,
  height: 800,
  backgroundColor: 0x0a0a0a,
  antialias: false,
});

// Add canvas to DOM
document.body.appendChild(app.canvas);

// Create world and add to stage
const world = new World(app.stage, app.screen.width, app.screen.height);

// Main loop
app.ticker.add((ticker) => {
    const delta = ticker.deltaTime;
    const dt = delta / 60;
    world.update(dt);
});
