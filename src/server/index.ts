import { defineServer, defineRoom, monitor } from "colyseus";
import { listen } from "@colyseus/tools";

import http from "http";
import express from "express";
import path from "path";
import basicAuth from "express-basic-auth";

import { MyRoom } from "./rooms/MyRoom";

export let STATIC_DIR: string;

const server = defineServer({
  rooms: {
    my_room: defineRoom(MyRoom),
  },

  express: (app) => {
    app.use("/", express.static(path.resolve(__dirname, "public")));

    // add colyseus monitor
    const auth = basicAuth({ users: { 'admin': 'admin' }, challenge: true });
    app.use("/colyseus", auth, monitor());
  }
});

listen(server).then(() =>
  console.log(`Listening on http://localhost:2567`));
