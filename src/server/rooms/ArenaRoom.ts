import { Room, Client, nosync } from "colyseus";
import * as nanoid from "nanoid";

class Entity {
  x: number;
  y: number;
  radius: number;

  @nosync angle: number = 0;
  @nosync speed = 0;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}

const WORLD_SIZE = 2000;

class State {
  width = WORLD_SIZE;
  height = WORLD_SIZE;

  entities: { [id: string]: Entity } = {};

  constructor () {
    // create some food entities
    for (let i=0; i<100; i++) {
      const food = new Entity(Math.random() * this.width, Math.random() * this.height, 2);
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

        // apply boundary limits
        if (entity.x < 0) { entity.x = 0; }
        if (entity.x > WORLD_SIZE) { entity.x = WORLD_SIZE; }
        if (entity.y < 0) { entity.y = 0; }
        if (entity.y > WORLD_SIZE) { entity.y = WORLD_SIZE; }
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
    if (command === "mouse") { 
      const entity = this.state.entities[client.sessionId];
      const distance = Math.sqrt(Math.pow(entity.y - data.y, 2) + Math.pow(entity.x - data.x, 2));
      entity.speed = (distance < 20) ? 0 : Math.min(distance / 10, 6);
      entity.angle = Math.atan2(entity.y - data.y, entity.x - data.x);
    }
  }

  onLeave(client: Client) {
    delete this.state.entities[client.sessionId];
  }

}
