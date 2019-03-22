import { Client } from "colyseus";
import * as nanoid from "nanoid";
import { Entity } from "./Entity";
import { Schema, type, MapSchema, filter } from "@colyseus/schema";

const WORLD_SIZE = 2000;
const DEFAULT_PLAYER_RADIUS = 10;

export class State extends Schema {

  width = WORLD_SIZE;
  height = WORLD_SIZE;

  @filter(function(this: State, client: Client, entity: Entity) {
    const currentPlayer = this.entities[client.sessionId] || {};

    var a = entity.x - currentPlayer.x;
    var b = entity.y - currentPlayer.y;

    return Math.sqrt(a * a + b * b) <= 200;
  })
  @type({ map: Entity })
  entities = new MapSchema<Entity>();

  initialize () {
    // create some food entities
    for (let i = 0; i < 100; i++) {
      this.createFood();
    }
  }

  createFood () {
    const radius = Math.max(4, (Math.random() * (DEFAULT_PLAYER_RADIUS - 1)));
    const food = new Entity(Math.random() * this.width, Math.random() * this.height, radius);
    this.entities[nanoid(8)] = food;
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
        continue;
      }

      if (entity.radius >= DEFAULT_PLAYER_RADIUS) {
        for (const collideSessionId in this.entities) {
          const collideTestEntity = this.entities[collideSessionId]

          // prevent collision with itself
          if (collideTestEntity === entity) {
            continue; 
          }

          if (
            entity.radius > collideTestEntity.radius && 
            Entity.distance(entity, collideTestEntity) <= entity.radius - (collideTestEntity.radius / 2)
          ) {
            let winnerEntity: Entity = entity;
            let loserEntity: Entity = collideTestEntity; 
            let loserEntityId: string = collideSessionId;

            winnerEntity.radius += loserEntity.radius / 5;
            loserEntity.dead = true;
            deadEntities.push(loserEntityId);

            // create a replacement food
            if (collideTestEntity.radius < DEFAULT_PLAYER_RADIUS) {
              this.createFood();

            } else {
              console.log(loserEntityId, "has been eaten!");
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