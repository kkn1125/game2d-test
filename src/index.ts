/* A quite detailed WebSockets upgrade example "async" */

import uWS, { WebSocket } from "uWebSockets.js";
import { PORT } from "./util/global";

let count = 1;
const units = new Map();

const app = uWS
  ./*SSL*/ App({
    /* key_file_name: "misc/key.pem",
    cert_file_name: "misc/cert.pem",
    passphrase: "1234", */
  })
  .ws("/*", {
    /* Options */
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 64,
    /* Handlers */
    upgrade: (res, req, context) => {
      console.log(
        "An Http connection wants to become WebSocket, URL: " +
          req.getUrl() +
          "!"
      );

      /* Keep track of abortions */
      const upgradeAborted = { aborted: false };

      /* You MUST copy data out of req here, as req is only valid within this immediate callback */
      const url = req.getUrl();
      const query = Object.fromEntries(new URLSearchParams(req.getQuery()));
      const secWebSocketKey = req.getHeader("sec-websocket-key");
      const secWebSocketProtocol = req.getHeader("sec-websocket-protocol");
      const secWebSocketExtensions = req.getHeader("sec-websocket-extensions");

      /* Simulate doing "async" work before upgrading */
      setTimeout(() => {
        console.log(
          "We are now done with our async task, let's upgrade the WebSocket!"
        );

        if (upgradeAborted.aborted) {
          console.log("Ouch! Client disconnected before we could upgrade it!");
          /* You must not upgrade now */
          return;
        }

        /* Cork any async response including upgrade */
        res.cork(() => {
          /* This immediately calls open handler, you must not use res after this call */
          res.upgrade(
            { url: url, id: Number(query.id) || count },
            /* Use our copies here */
            secWebSocketKey,
            secWebSocketProtocol,
            secWebSocketExtensions,
            context
          );
          query.id === undefined && count++;
        });
      }, 1000);

      /* You MUST register an abort handler to know if the upgrade was aborted by peer */
      res.onAborted(() => {
        /* We can simply signal that we were aborted */
        upgradeAborted.aborted = true;
      });
    },
    open: (ws) => {
      console.log("[INIT] create user", count);
      units.set((ws as any).id, {
        id: (ws as any).id,
        x: 0,
        y: 0,
        size: 30,
      });
      ws.subscribe("broadcast");
      ws.send(
        JSON.stringify({
          type: "init",
          id: (ws as any).id,
          users: Array.from(units.entries()).map(([k, v]) => v),
        })
      );
      ws.publish(
        "broadcast",
        JSON.stringify({
          type: "list",
          users: Array.from(units.entries()).map(([k, v]) => v),
        })
      );
    },
    message: (ws, message, isBinary) => {
      /* Ok is false if backpressure was built up, wait for drain */
      if (isBinary) {
        const view = new DataView(message);
        const id = view.getUint8(0);
        const upx = view.getUint8(1);
        const upy = view.getUint8(2);
        const numX = view.getUint8(3);
        const restX = view.getUint8(4);
        const numY = view.getUint8(5);
        const restY = view.getUint8(6);
        const xup = Boolean(upx) ? 1 : -1;
        const yup = Boolean(upy) ? 1 : -1;
        const pox = (numX + restX / 10) * xup;
        const poy = (numY + restY / 10) * yup;

        // console.log(id, pox, poy);

        app.publish("broadcast", message, isBinary);
      } else {
        const data = JSON.parse(Buffer.from(message).toString());
        app.publish("broadcast", data);
      }
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      console.log("WebSocket closed:", (ws as any).id);
      units.delete((ws as any).id);
      app.publish(
        "broadcast",
        JSON.stringify({
          type: "out",
          id: (ws as any).id,
        })
      );
    },
  })
  .any("/*", (res, req) => {
    res.end("Nothing to see here!");
  })
  .listen(PORT, (token) => {
    if (token) {
      console.log("Listening to port " + PORT);
    } else {
      console.log("Failed to listen to port " + PORT);
    }
  });
