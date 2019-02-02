import * as PIXI from "pixi.js";
import { Client, DataChange } from "colyseus.js";

const entities: {[id: string]: PIXI.Graphics} = {};
let currentPlayerEntity: PIXI.Graphics;

const app = new PIXI.Application({ width: 800, height: 600, backgroundColor: 0x000000 });
document.body.appendChild(app.view);

const client = new Client("ws://localhost:8080");
const room = client.join("arena");

room.onJoin.add(() => {
    window.onmousemove = function (e: MouseEvent) {
        if (currentPlayerEntity) {
            // const angle = 180 * Math.atan2(e.clientX - currentPlayerEntity.x, e.clientY - currentPlayerEntity.y) / Math.PI;
            // console.log(e.clientX - currentPlayerEntity.x,  e.clientY - currentPlayerEntity.y);
            const angle = Math.atan2(e.clientX - currentPlayerEntity.x, e.clientY - currentPlayerEntity.y);
            room.send(['angle', angle]);
        }
    }
});

// add / removal of entities
room.listen("entities/:id", (change: DataChange) => {
    if (change.operation === "add") {
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(0);
        graphics.beginFill(0xFFFF0B, 0.5);
        graphics.drawCircle(0, 0, change.value.radius);
        graphics.endFill();

        graphics.x = change.value.x;
        graphics.y = change.value.y;
        app.stage.addChild(graphics);

        entities[change.path.id] = graphics;

        // detecting current user
        if (change.path.id === room.sessionId) {
            currentPlayerEntity = graphics;
        }

    } else if (change.operation === "remove") {
        app.stage.removeChild(entities[change.path.id]);
        entities[change.path.id].destroy();
        delete entities[change.path.id];
    }
});

room.listen("entities/:id/:axis", (change: DataChange) => {
    entities[change.path.id][change.path.axis] = change.value;
});

room.onMessage.add(() => {});