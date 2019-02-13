import * as PIXI from "pixi.js";
import * as Viewport from "pixi-viewport";
import { Client, DataChange } from "colyseus.js";

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a

const WORLD_SIZE = 2000;

export class Application extends PIXI.Application {
    entities: { [id: string]: PIXI.Graphics } = {};
    currentPlayerEntity: PIXI.Graphics;

    client = new Client(window.location.href.replace("http", "ws"));
    room = this.client.join("arena");

    viewport: Viewport;

    _axisListener: any;
    _interpolation: boolean;

    constructor () {
        super({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x0c0c0c
        });

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: WORLD_SIZE,
            worldHeight: WORLD_SIZE,
        });

        // draw boundaries of the world
        const boundaries = new PIXI.Graphics();
        boundaries.beginFill(0x000000);
        boundaries.drawRoundedRect(0, 0, WORLD_SIZE, WORLD_SIZE, 30);
        this.viewport.addChild(boundaries);

        // add viewport to stage
        this.stage.addChild(this.viewport);

        this.initialize();
        this.interpolation = false;

        this.viewport.on("mousemove", (e) => {
            if (this.currentPlayerEntity) {
                const point = this.viewport.toLocal(e.data.global);
                this.room.send(['mouse', { x: point.x, y: point.y }]);
            }
        });
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

            // if (this.currentPlayerEntity) {
            //     // console.log(this.currentPlayerEntity.width);
            //     // console.log(this.currentPlayerEntity.width / 20);
            //     this.viewport.scale.x = lerp(this.viewport.scale.x, this.currentPlayerEntity.width / 20, 0.2)
            //     this.viewport.scale.y = lerp(this.viewport.scale.y, this.currentPlayerEntity.width / 20, 0.2)
            // }

        });
    }

    set interpolation (bool: boolean) {
        this._interpolation = bool;

        if (this._interpolation) {
            this.room.removeListener(this._axisListener);
            this.loop();

        } else {
            // update entities position directly when they arrive
            this._axisListener = this.room.listen("entities/:id/:axis", (change: DataChange) => {
                this.entities[change.path.id][change.path.axis] = change.value;
            }, true);
        }
    }

    loop () {
        for (let id in this.entities) {
            this.entities[id].x = lerp(this.entities[id].x, this.room.state.entities[id].x, 0.2);
            this.entities[id].y = lerp(this.entities[id].y, this.room.state.entities[id].y, 0.2);
        }

        // continue looping if interpolation is still enabled.
        if (this._interpolation) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
}