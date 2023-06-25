import { APP, canvas, ctx } from "./util/global";

const SIZE = {
  UNIT: 30,
};
const SPEED = {
  UNIT: 5,
};

const me: { id: number } = {
  id: 0,
};

let socket: WebSocket;

window.addEventListener("load", () => {
  socket = new WebSocket("ws://localhost:9000");
  socket.binaryType = "arraybuffer";

  socket.onopen = () => {
    console.log("socket connect");
  };
  socket.onmessage = ({ data }) => {
    try {
      const json = JSON.parse(data);
      if (json.type === "init") {
        me.id = json.id;

        units.set(me.id, {
          id: me.id,
          x: 0,
          y: 0,
          size: SIZE.UNIT,
        });
        json.users.forEach((user: Unit) => {
          // console.log(user);
          if (!units.has(user.id)) {
            units.set(user.id, user);
          }
        });
      } else if (json.type === "list") {
        // console.log("receive", json.users);
        json.users.forEach((user: Unit) => {
          // console.log(user);
          if (!units.has(user.id)) {
            units.set(user.id, user);
          }
        });
      } else if (json.type === "out") {
        units.delete(json.id);
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
        // console.log(id, pox, poy);
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
});

type Unit = { id: number; x: number; y: number; size: number };
const units: Map<number, Unit> = new Map();

APP().append(canvas);

window.addEventListener("load", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

function renderUnit({ id, size, x, y }: Unit) {
  moveUnit();
  const baseX = innerWidth / 2;
  const baseY = innerHeight / 2;
  const unitX = x * SPEED.UNIT * 10;
  const unitY = y * SPEED.UNIT * 10;
  ctx.textAlign = "center";
  ctx.font = "bold 1rem Arial";
  ctx.fillText(
    `guest-${id}`.toUpperCase(),
    baseX + unitX + size / 2,
    baseY + unitY - size / 2
  );
  ctx.fillRect(baseX + unitX, baseY + unitY, size, size);
}

function moveUnit() {
  if (me.id) {
    const unit = units.get(me.id) as Unit;
    let unitMoveY = unit.y;
    let unitMoveX = unit.x;

    if (joystick["w"] || joystick["s"] || joystick["a"] || joystick["d"]) {
      if (joystick["w"] && me.id) {
        unitMoveY = Number((unitMoveY - 0.1).toFixed(2));
      }
      if (joystick["s"]) {
        unitMoveY = Number((unitMoveY + 0.1).toFixed(2));
      }
      if (joystick["a"]) {
        unitMoveX = Number((unitMoveX - 0.1).toFixed(2));
      }
      if (joystick["d"]) {
        unitMoveX = Number((unitMoveX + 0.1).toFixed(2));
      }

      const view = new Uint8Array(7);

      // console.log("position", unit.id, unit.x, unit.y);

      const numX = Number(String(unitMoveX).split(".")[0]);
      const restX =
        unitMoveX * 10 - Number(String(unitMoveX).split(".")[0]) * 10;
      const numY = Number(String(unitMoveY).split(".")[0]);
      const restY =
        unitMoveY * 10 - Number(String(unitMoveY).split(".")[0]) * 10;
      view[0] = unit.id;
      view[1] = unitMoveX > 0 ? 1 : 0;
      view[2] = unitMoveY > 0 ? 1 : 0;
      view[3] = Math.abs(numX);
      view[4] = Math.abs(restX);
      view[5] = Math.abs(numY);
      view[6] = Math.abs(restY);

      socket.send(view);
    }
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
}

function render(timer?: number) {
  clearCanvas();
  units.forEach((unit) => {
    renderUnit(unit);
  });
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

const joystick = {
  w: false,
  s: false,
  a: false,
  d: false,
};

window.addEventListener("keydown", (e) => {
  const key = e.key;
  switch (key) {
    case "w":
      joystick["w"] = true;
      break;
    case "s":
      joystick["s"] = true;
      break;
    case "a":
      joystick["a"] = true;
      break;
    case "d":
      joystick["d"] = true;
      break;
    default:
      break;
  }
});
window.addEventListener("keyup", (e) => {
  const key = e.key;
  switch (key) {
    case "w":
      joystick["w"] = false;
      break;
    case "s":
      joystick["s"] = false;
      break;
    case "a":
      joystick["a"] = false;
      break;
    case "d":
      joystick["d"] = false;
      break;
    default:
      break;
  }
});

export {};
