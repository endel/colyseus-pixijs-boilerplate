import { Room, Client, nosync } from "colyseus";
import * as nanoid from "nanoid";

const WORLD_SIZE = 2000;
const DEFAULT_PLAYER_RADIUS = 10;

function distance (a: Entity, b: Entity) {
  return Math.sqrt(Math.pow(a.y - b.y, 2) + Math.pow(a.x - b.x, 2))
}

class Entity {
  x: number;
  y: number;
  radius: number;

  @nosync dead: boolean = false;
  @nosync angle: number = 0;
  @nosync speed = 0;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}

class State {
  width = WORLD_SIZE;
  height = WORLD_SIZE;

  entities: { [id: string]: Entity } = {};

  constructor () {
    // create some food entities
    for (let i=0; i<100; i++) {
      this.createFood();
    }
  }

  createFood () {
    const food = new Entity(Math.random() * this.width, Math.random() * this.height, 2);
    this.entities[nanoid()] = food;
  }

  createPlayer (sessionId: string) {
    this.entities[sessionId] = new Entity(
      Math.random() * this.width,
      Math.random() * this.height,
      DEFAULT_PLAYER_RADIUS
    );
  }

  update() {
    const deadEntities: string[] = [];
    for (const sessionId in this.entities) {
      const entity = this.entities[sessionId];

      if (entity.dead) {
        deadEntities.push(sessionId);
      }

      if (entity.radius >= DEFAULT_PLAYER_RADIUS) {
        for (const collideSessionId in this.entities) {
          const collideTestEntity = this.entities[collideSessionId]

          // prevent collision with itself
          if (collideTestEntity === entity) { continue; }

          if (distance(entity, collideTestEntity) < entity.radius) {
            entity.radius += collideTestEntity.radius / 5;
            collideTestEntity.dead = true;
            deadEntities.push(collideSessionId);

            // create a replacement food
            if (collideTestEntity.radius < DEFAULT_PLAYER_RADIUS) {
              this.createFood();
            }
          }
        }
      }

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

    // delete all dead entities
    deadEntities.forEach(entityId => delete this.entities[entityId]);
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
    const entity = this.state.entities[client.sessionId];

    // skip dead players
    if (!entity) {
      console.log("DEAD PLAYER ACTING...");
      return;
    }

    const [command, data] = message;

  // change angle
    if (command === "mouse") { 
      const dst = distance(entity, data as Entity);
      entity.speed = (dst < 20) ? 0 : Math.min(dst / 10, 6);
      entity.angle = Math.atan2(entity.y - data.y, entity.x - data.x);
    }
  }

  onLeave(client: Client) {
    const entity = this.state.entities[client.sessionId];

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }

}
