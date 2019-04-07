import { Room, Client } from "colyseus";
import { Entity } from "./Entity";
import { State } from "./State";

export class ArenaRoom extends Room<State> {

  onInit() {
    this.setState(new State());
    this.state.initialize();
    this.setSimulationInterval(() => this.state.update());
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "JOINED");
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
      entity.speed = (dst < 20) ? 0 : Math.min(dst / 15, 4);
      entity.angle = Math.atan2(entity.y - data.y, entity.x - data.x);
    }
  }

  onLeave(client: Client) {
    console.log(client.sessionId, "LEFT!");
    const entity = this.state.entities[client.sessionId];

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }

}
