# Colyseus + PixiJS <a href="https://patreon.com/endel" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fendel&style=for-the-badge" alt="Donate on Patreon"/></a>

A simple boilerplate using Colyseus + PixiJS. It implements a simplistic version of the classical [agar.io](http://agar.io/) game.

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
│           ├── ArenaRoom.ts
│           ├── Entity.ts
│           └── State.ts
├── tsconfig-client.json
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