import { Entity } from "./Entity";
import { DEFAULT_PLAYER_RADIUS } from "./State";

export class Player extends Entity {
    constructor(x: number, y: number) {
        super(x, y, DEFAULT_PLAYER_RADIUS);
    }
}