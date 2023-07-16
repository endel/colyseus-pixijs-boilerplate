# Colyseus + PixiJS

A simple boilerplate using Colyseus + PixiJS. It implements a simplistic version of the classic [agar.io](http://agar.io/) game.

## Running server and client locally

```
git clone https://github.com/endel/colyseus-pixijs-boilerplate.git
cd colyseus-pixijs-boilerplate
npm install
npm start
```

Open [http://localhost:1234](http://localhost:1234) in your browser.

> The `npm start` runs both `npm run start-client` and `npm run start-server`.
> You need both client and server to test this application.

## Directory structure

```
├── nodemon.json
├── package.json
├── src
│   ├── client
│   │   ├── Application.ts
│   │   ├── index.html
│   │   └── index.ts
│   └── server
│       ├── index.ts
│       └── rooms
│           ├── MyRoom.ts
│           ├── Entity.ts
│           └── State.ts
├── tsconfig.json
└── webpack.config.js
```

- All frontend dependencies should be included as `devDependencies` on `package.json`.
- All backend dependencies should be included as `dependencies` on `package.json`.

## TODO:
- [ ] Enter name before starting the game
- [ ] Re-spawn button after dead
- [ ] Leaderboard

## License

MIT
