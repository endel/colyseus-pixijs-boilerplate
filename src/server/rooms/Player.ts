import { Entity } from "./Entity";
import { DEFAULT_PLAYER_RADIUS } from "./State";

export class Player extends Entity {
    constructor() {
        super();
        this.radius = DEFAULT_PLAYER_RADIUS;
    }
}