import { Application } from "pixi.js";
import { World } from "./world.ts";
import { SimulationController } from "./simulationController";

const app = new Application();
await app.init({
  width: 1200,
  height: 800,
  backgroundColor: 0x0a0a0a,
  antialias: false,
});

// Add canvas to DOM
document.body.appendChild(app.canvas);

const controller = new SimulationController();
let simulationTime = 0;

// Create world and add to stage
const world = new World(app.stage, app.screen.width, app.screen.height);

// Main loop
app.ticker.add((ticker) => {
  if (!controller.isRunning()) return;

  const delta = ticker.deltaTime;
  const dt = delta / 30;

  simulationTime = dt * controller.getSpeed();

  world.update(simulationTime);
});

const playPauseBtn = document.getElementById("playPause") as HTMLButtonElement;
const speedSelect = document.getElementById("speed") as HTMLSelectElement;

playPauseBtn.addEventListener("click", () => {
  controller.togglePause();
  playPauseBtn.textContent = controller.isRunning() ? "⏸ Pause" : "▶️ Play";
});

speedSelect.addEventListener("change", (e) => {
  const newSpeed = parseFloat((e.target as HTMLSelectElement).value);
  controller.setSpeed(newSpeed);
});
