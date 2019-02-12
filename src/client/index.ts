import { Application } from "./Application";

const app = new Application();
document.body.appendChild(app.view);
app.loop();