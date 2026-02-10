import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Room, Client, Callbacks } from "@colyseus/sdk";
import type { State } from "../server/rooms/State";

const ENDPOINT = "http://localhost:2567";
const WORLD_SIZE = 2000;

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a

export class Application extends PIXI.Application {
    entities: { [id: string]: PIXI.Graphics } = {};
    currentPlayerEntity?: PIXI.Graphics;

    client = new Client(ENDPOINT);
    room?: Room<State>;

    viewport?: Viewport;
    _interpolation?: boolean;

    async init(options?: Partial<PIXI.ApplicationOptions> | undefined): Promise<void> {
        await super.init({        
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x0c0c0c,
            ...options,
        });

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: WORLD_SIZE,
            worldHeight: WORLD_SIZE,
            events: this.renderer.events
        });

        // draw boundaries of the world
        const boundaries = new PIXI.Graphics();        
        boundaries.roundRect(0, 0, WORLD_SIZE, WORLD_SIZE, 30).fill(0x000000);
        this.viewport.addChild(boundaries);

        // add viewport to stage
        this.stage.addChild(this.viewport);

        this.connect();

        this.interpolation = false;

        // Handle mouse movement for player control
        this.viewport.on("mousemove", (e) => {
            if (this.currentPlayerEntity && this.viewport && this.room) {
                const point = this.viewport.toWorld(e.global);
                this.room.send('mouse', { x: point.x, y: point.y });
            }
        });
    }

    async connect() {
        this.room = await this.client.joinOrCreate<State>("my_room");

        const callbacks = Callbacks.get(this.room);

        callbacks.onAdd("entities", (entity, sessionId: string) => {
            const color = (entity.radius < 10)
                ? 0xff0000
                : 0xFFFF0B;

            const graphics = new PIXI.Graphics();
            graphics.setStrokeStyle(0).setFillStyle({ color, alpha: 0.5 });
            graphics.circle(0, 0, entity.radius);
            graphics.fill();            

            graphics.x = entity.x;
            graphics.y = entity.y;
            
            this.viewport!.addChild(graphics);

            this.entities[sessionId] = graphics;

            // detecting current user
            if (sessionId === this.room?.sessionId) {
                this.currentPlayerEntity = graphics;
                this.viewport!.follow(this.currentPlayerEntity);
            }

            callbacks.onChange(entity, () => {
                const color = (entity.radius < 10) ? 0xff0000 : 0xFFFF0B;

                const graphics = this.entities[sessionId];

                // set x/y directly if interpolation is turned off
                if (!this._interpolation) {
                    graphics.x = entity.x;
                    graphics.y = entity.y;
                }

                graphics.clear();
                graphics.setStrokeStyle(0);
                graphics.setFillStyle({ color, alpha: 0.5 });
                graphics.circle(0, 0, entity.radius);
                graphics.fill();
            });
        });

        callbacks.onRemove("entities", (_, sessionId: string) => {
            this.viewport!.removeChild(this.entities[sessionId]);
            this.entities[sessionId].destroy();
            delete this.entities[sessionId];
        });
    }

    set interpolation (bool: boolean) {
        this._interpolation = bool;

        if (this._interpolation) {
            this.loop();
        }
    }

    loop () {
        for (let id in this.entities) {
            const entity = this.room?.state.entities.get(id);
            if(entity){
                this.entities[id].x = lerp(this.entities[id].x, entity.x, 0.2);
                this.entities[id].y = lerp(this.entities[id].y, entity.y, 0.2);
            }
        }

        // continue looping if interpolation is still enabled.
        if (this._interpolation) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
}
