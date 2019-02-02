import { Room, Client, nosync } from "colyseus";
import * as nanoid from "nanoid";

class Entity {
  x: number;
  y: number;
  radius: number;

  @nosync angle: number = 0;
  @nosync speed = 5;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}

class State {
  width = 800;
  height = 600;

  entities: { [id: string]: Entity } = {};

  constructor () {
    // create some food entities
    for (let i=0; i<100; i++) {
      const food = new Entity(Math.random() * this.width, Math.random() * this.height, 2);
      food.speed = 0;
      this.entities[nanoid()] = food;
    }
  }

  createPlayer (sessionId: string) {
    this.entities[sessionId] = new Entity(Math.random() * this.width, Math.random() * this.height, 10);
  }

  update() {
    for (let sessionId in this.entities) {
      const entity = this.entities[sessionId];
      if (entity.speed > 0) {
        entity.x -= (Math.cos(entity.angle)) * entity.speed;
        entity.y -= (Math.sin(entity.angle)) * entity.speed;
      }
    }
  }
}

export class ArenaRoom extends Room {

  onInit() {
    this.setState(new State());
    this.setSimulationInterval(() => this.state.update());
  }

  onJoin(client: Client, options: any) {
    this.state.createPlayer(client.sessionId);
  }

  onMessage(client: Client, message: any) {
    const [command, data] = message;

  // change angle
    if (command === "a") { 
      this.state.entities[client.sessionId].angle = data;
    }
  }

  onLeave(client: Client) {
    delete this.state.entities[client.sessionId];
  }

}
