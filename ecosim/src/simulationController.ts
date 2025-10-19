// src/simulationController.ts
export class SimulationController {
  private running = true;
  private speed = 1;

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
