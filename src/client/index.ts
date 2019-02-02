import * as PIXI from "pixi.js";
import { Client, DataChange } from "colyseus.js";

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a

const entities: {[id: string]: PIXI.Graphics} = {};
let currentPlayerEntity: PIXI.Graphics;

const app = new PIXI.Application({ width: 800, height: 600, backgroundColor: 0x000000 });
document.body.appendChild(app.view);

const client = new Client("ws://localhost:8080");
const room = client.join("arena");

room.onMessage.add(() => {});

room.onJoin.add(() => {
});

// add / removal of entities
room.listen("entities/:id", (change: DataChange) => {
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

// // update entities position directly when they arrive
// room.listen("entities/:id/:axis", (change: DataChange) => {
//     entities[change.path.id][change.path.axis] = change.value;
// });

window.onmousemove = function (e: MouseEvent) {
    if (currentPlayerEntity) {
        const angle = Math.atan2(currentPlayerEntity.y - e.clientY, currentPlayerEntity.x - e.clientX);
        room.send(['a', angle]);
    }
}

//
// update entities positions: lerp previous position with the latest value from the server
//
function animate () {
    for (let id in entities) {
        entities[id].x = lerp(entities[id].x, room.state.entities[id].x, 0.2);
        entities[id].y = lerp(entities[id].y, room.state.entities[id].y, 0.2);
    }
    requestAnimationFrame(animate);
}
animate();