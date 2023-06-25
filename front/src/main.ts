import GameMap from "./model/GameMap";
import User from "./model/User";
import {
  APP,
  canvas,
  ctx,
  joystick,
  master,
  SPEED,
  units,
} from "./util/global";

let socket: WebSocket;

const map = new GameMap();

window.addEventListener("load", () => {
  const me = (master.me = new User());
  socket = new WebSocket("ws://localhost:9000");
  socket.binaryType = "arraybuffer";

  socket.onopen = () => {
    console.log("socket connect");
  };

  socket.onmessage = ({ data }) => {
    try {
      const json = JSON.parse(data);
      if (json.type === "init") {
        me.setId(json.id);
        me.setXY(0, 0);
        // me.setSocket(socket);

        units.set(me.id, me);
        json.users.forEach((user: User) => {
          if (!units.has(user.id)) {
            const newUser = new User(user.id, user.x, user.y, user.size);
            units.set(newUser.id, newUser);
          }
        });
      } else if (json.type === "list") {
        json.users.forEach((user: User) => {
          if (!units.has(user.id)) {
            const newUser = new User(user.id, user.x, user.y, user.size);
            units.set(newUser.id, newUser);
          }
        });
      } else if (json.type === "out") {
        units.delete(json.id);
      }
    } catch (error) {
      const packet = User.getPacket(data)[1];
      const { id, pox, poy } = packet;
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

APP().append(canvas);

// function renderUnit({ id, size, x, y }: User) {
//   moveUnit();
//   const baseX = innerWidth / 2;
//   const baseY = innerHeight / 2;
//   const unitX = x * SPEED.UNIT * 10;
//   const unitY = y * SPEED.UNIT * 10;
//   ctx.textAlign = "center";
//   ctx.font = "bold 1rem Arial";
//   ctx.fillText(
//     `guest-${id}`.toUpperCase(),
//     baseX + unitX + size / 2,
//     baseY + unitY - size / 2
//   );
//   ctx.fillRect(baseX + unitX, baseY + unitY, size, size);
// }

function moveUnit() {
  if (master.me.id) {
    const view = User.setPacket(master.me);

    if (view) {
      socket.send(view);
    }
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
}

function render(timer?: number) {
  clearCanvas();
  map.render();
  if (master.me) {
    map.collision();
  }

  units.forEach((unit) => {
    moveUnit();

    unit.render(master.me.id === unit.id);
  });
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

window.addEventListener("load", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});
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
