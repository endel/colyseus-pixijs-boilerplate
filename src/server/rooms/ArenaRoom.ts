import { Room, Client } from "colyseus";
import { Entity } from "./Entity";
import { State } from "./State";

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
      const dst = Entity.distance(entity, data as Entity);
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
