import { Room, Client, nosync } from "colyseus";

class Entity {
  x: number;
  y: number;
  radius: number;

  @nosync angle: number = 0;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}

class State {
  entities: { [id: string]: Entity } = {};

  update() {
    for (let sessionId in this.entities) {
      const entity = this.entities[sessionId];
      entity.x += (Math.cos(entity.angle) * 1) + 1;
      entity.y += (Math.sin(entity.angle) * 1) + 1;
    }
  }
}

export class ArenaRoom extends Room {

  onInit() {
    this.setState(new State());
    this.setSimulationInterval(() => this.state.update());
  }

  onJoin(client: Client, options: any) {
    this.state.entities[client.sessionId] = new Entity(Math.random() * 800, Math.random() * 600, 10);
  }

  onMessage(client: Client, message: any) {
    const [command, data] = message;

    if (command === "angle") {
      this.state.entities[client.sessionId].angle = data;
    }
  }

  onLeave(client: Client) {
    delete this.state.entities[client.sessionId];
  }

}
