import { Schema, type } from "@colyseus/schema";

export class Entity extends Schema {
    @type("float64") x: number;
    @type("float64") y: number;
    @type("float32") radius: number;

    dead: boolean = false;
    angle: number = 0;
    speed = 0;

    constructor(x: number, y: number, radius: number) {
        super();

        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    static distance(a: Entity, b: Entity) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    }
}