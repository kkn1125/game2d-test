const WebSocket = require("ws");

const me = {
  id: 0,
};
const units = new Map();

let selector = 0;

let count = 30;

const start = 100;
const end = count + start;

const dummyPlayers = new Map();

let loadDone = false;

function connect(id) {
  const socket = new WebSocket(`ws://localhost:9000?id=${id}`);
  socket.binaryType = "arraybuffer";

  socket.onopen = () => {
    console.log("socket connect", id);

    dummyPlayers.set(id, {
      id: id,
      x: 0,
      y: 0,
      size: 30,
      socket: socket,
    });
  };
  socket.onmessage = ({ data }) => {
    try {
      const json = JSON.parse(data);
      if (json.type === "init") {
        // units.set(id, {
        //   id: id,
        //   x: 0,
        //   y: 0,
        //   size: 30,
        // });

        me.id = json.id;
        units.set(me.id, {
          id: me.id,
          x: 0,
          y: 0,
          size: 30,
        });
        console.log("data bind:", id);

        loadDone = true;
        // json.users.forEach((user) => {
        //   console.log(user);
        //   if (!units.has(user.id)) {
        //     units.set(user.id, user);
        //   }
        // });
      } else if (json.type === "list") {
        // console.log("receive", json.users);
        // json.users.forEach((user) => {
        //   console.log(user);
        //   if (!units.has(user.id)) {
        //     units.set(user.id, user);
        //   }
        // });
      }
    } catch (error) {
      const view = new DataView(data);
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
      if (units.has(id)) {
        const unit = units.get(id);
        if (unit) {
          Object.assign(unit, {
            x: pox,
            y: poy,
          });
        }
      }
    }
  };
  socket.onclose = () => {
    console.log("socket close");
  };
}

for (let i = start; i < end; i++) {
  connect(i);
}

function playRandom(id) {
  const player = dummyPlayers.get(id);
  if (player) {
    let unitMoveX = Math.random() * 2;
    let unitMoveY = Math.random() * 2;

    const view = new Uint8Array(7);

    // console.log("position", unit.id, unit.x, unit.y);

    const numX = Number(String(unitMoveX).split(".")[0]);
    const restX = unitMoveX * 10 - Number(String(unitMoveX).split(".")[0]) * 10;
    const numY = Number(String(unitMoveY).split(".")[0]);
    const restY = unitMoveY * 10 - Number(String(unitMoveY).split(".")[0]) * 10;
    view[0] = player.id;
    view[1] = unitMoveX > 0 ? 1 : 0;
    view[2] = unitMoveY > 0 ? 1 : 0;
    view[3] = Math.abs(numX);
    view[4] = Math.abs(restX);
    view[5] = Math.abs(numY);
    view[6] = Math.abs(restY);

    player.socket.send(view);
  }
}

setInterval(() => {
  if (loadDone) {
    playRandom((selector % count) + start);
    selector++;
  }
}, 16);
