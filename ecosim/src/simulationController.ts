// src/simulationController.ts
export class SimulationController {
  private running = true;
  private speed = 1;
  private foodSpawnInterval = 0.1; // seconds

  togglePause() {
    this.running = !this.running;
  }

  setSpeed(multiplier: number) {
    this.speed = multiplier;
  }

  isRunning() {
    return this.running;
  }

  getSpeed() {
    return this.speed;
  }
}
