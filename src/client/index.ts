import { Application } from "./Application";

const app = new Application();

// Initialize the application
app.init().then(() => {
    app.interpolation = true;
    document.body.appendChild(app.canvas);
});

(window as any).app = app;

// allow to resize viewport and renderer
window.onresize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.viewport!.resize(window.innerWidth, window.innerHeight);
}

// toggle interpolation
document.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;

    if (el.id === "interpolation") {
        app.interpolation = (el as HTMLInputElement).checked;

    }
});
