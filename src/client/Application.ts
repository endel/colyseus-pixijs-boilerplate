import * as PIXI from "pixi.js";
import * as Viewport from "pixi-viewport";
import { Client, DataChange } from "colyseus.js";

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a

const WORLD_SIZE = 2000;

export class Application extends PIXI.Application {
    entities: { [id: string]: PIXI.Graphics } = {};
    currentPlayerEntity: PIXI.Graphics;

    client = new Client("ws://localhost:8080");
    room = this.client.join("arena");

    viewport: Viewport;

    constructor () {
        super({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x0f0f0f
        });

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: WORLD_SIZE,
            worldHeight: WORLD_SIZE,
        });

        const boundaries = new PIXI.Graphics();
        boundaries.beginFill(0x000000);
        boundaries.drawRoundedRect(0, 0, WORLD_SIZE, WORLD_SIZE, 30);
        this.viewport.addChild(boundaries);

        this.stage.addChild(this.viewport);

        this.initialize();
    }

    initialize() {
        // add / removal of entities
        this.room.listen("entities/:id", (change: DataChange) => {
            if (change.operation === "add") {
                const color = (change.value.radius < 4)
                    ? 0xff0000
                    : 0xFFFF0B;

                const graphics = new PIXI.Graphics();
                graphics.lineStyle(0);
                graphics.beginFill(color, 0.5);
                graphics.drawCircle(0, 0, change.value.radius);
                graphics.endFill();

                graphics.x = change.value.x;
                graphics.y = change.value.y;
                this.viewport.addChild(graphics);

                this.entities[change.path.id] = graphics;

                // detecting current user
                if (change.path.id === this.room.sessionId) {
                    this.currentPlayerEntity = graphics;
                    this.viewport.follow(this.currentPlayerEntity);
                }

            } else if (change.operation === "remove") {
                this.viewport.removeChild(this.entities[change.path.id]);
                this.entities[change.path.id].destroy();
                delete this.entities[change.path.id];
            }
        });

        this.room.listen("entities/:id/radius", (change: DataChange) => {
            const color = (change.value < 4) ? 0xff0000 : 0xFFFF0B;

            const graphics = this.entities[change.path.id];
            graphics.clear();
            graphics.lineStyle(0);
            graphics.beginFill(color, 0.5);
            graphics.drawCircle(0, 0, change.value);
            graphics.endFill();

            // this.viewport.zoom(change.value / 10);
            // if (this.currentPlayerEntity) {
            //     // console.log(this.currentPlayerEntity.width);
            //     // console.log(this.currentPlayerEntity.width / 20);
            //     this.viewport.scale.x = lerp(this.viewport.scale.x, this.currentPlayerEntity.width / 20, 0.2)
            //     this.viewport.scale.y = lerp(this.viewport.scale.y, this.currentPlayerEntity.width / 20, 0.2)
            // }

        });

        this.stage.interactive = true;
        this.viewport.on("mousemove", (e) => {
            if (this.currentPlayerEntity) {
                const point = this.viewport.toLocal(e.data.global);
                this.room.send(['mouse', {x: point.x, y: point.y}]);
            }
        });

        // // THIS IS CHOPPY
        // // update entities position directly when they arrive
        // this.room.listen("entities/:id/:axis", (change: DataChange) => {
        //     this.entities[change.path.id][change.path.axis] = change.value;
        // });
    }

    loop () {
        for (let id in this.entities) {
            this.entities[id].x = lerp(this.entities[id].x, this.room.state.entities[id].x, 0.2);
            this.entities[id].y = lerp(this.entities[id].y, this.room.state.entities[id].y, 0.2);
        }

        requestAnimationFrame(this.loop.bind(this));
    }
}