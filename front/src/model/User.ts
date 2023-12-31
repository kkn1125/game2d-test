import {
  COLOR,
  ctx,
  joystick,
  master,
  SCALE,
  SIZE,
  units,
} from "../util/global";

export default class User {
  /* basic properties */
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;

  /* intialize properties */
  constructor(id?: number, x?: number, y?: number, size?: number) {
    id !== undefined && (this.id = id);
    x !== undefined && (this.x = x);
    y !== undefined && (this.y = y);
    size !== undefined && (this.size = size);
    this.size ??= SIZE.UNIT * SCALE.RATIO;
    this.color = COLOR.UNIT;
  }

  warnColor() {
    this.color = COLOR.WARN;
  }
  defaultColor() {
    this.color = COLOR.UNIT;
  }

  setId(id: number) {
    this.id = id;
  }

  setXY(x: number, y: number) {
    this.x = x || 0;
    this.y = y || 0;
  }

  setSize(size: number) {
    this.size = size;
  }

  toJSON() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      size: this.size,
    } as User;
  }

  render(isMe: boolean) {
    const baseX = innerWidth / 2;
    const baseY = innerHeight / 2;
    const unitX = isMe
      ? 0
      : this.x * SCALE.UNIT * SCALE.RATIO -
        master.me.x * SCALE.UNIT * SCALE.RATIO;
    const unitY = isMe
      ? 0
      : this.y * SCALE.UNIT * SCALE.RATIO -
        master.me.y * SCALE.UNIT * SCALE.RATIO;
    ctx.fillStyle = COLOR.NAME;
    ctx.textAlign = "center";
    ctx.font = "bold 1rem Arial";
    ctx.fillText(
      `guest-${this.id}`.toUpperCase(),
      baseX + unitX + this.size / 2,
      baseY + unitY - this.size / 2
    );
    ctx.fillStyle = this.color;
    // console.log(this.color)
    ctx.fillRect(baseX + unitX, baseY + unitY, this.size, this.size);
  }

  /* convert packet to dataview and json */
  static getPacket(data: any) {
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
    return [
      view,
      {
        id,
        pox,
        poy,
      },
    ] as [DataView, { id: number; pox: number; poy: number }];
  }

  /* generate packet for socket binary data */
  static setPacket(myUnit: User) {
    const unit = units.get(myUnit.id) as User;
    let unitMoveY = unit.y;
    let unitMoveX = unit.x;

    if (joystick["w"] || joystick["s"] || joystick["a"] || joystick["d"]) {
      if (joystick["w"] && myUnit.id) {
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
      const numX = Number(String(unitMoveX).split(".")[0]);
      const restX =
        unitMoveX * SCALE.RATIO -
        Number(String(unitMoveX).split(".")[0]) * SCALE.RATIO;
      const numY = Number(String(unitMoveY).split(".")[0]);
      const restY =
        unitMoveY * SCALE.RATIO -
        Number(String(unitMoveY).split(".")[0]) * SCALE.RATIO;

      view[0] = unit.id;
      view[1] = unitMoveX > 0 ? 1 : 0;
      view[2] = unitMoveY > 0 ? 1 : 0;
      view[3] = Math.abs(numX);
      view[4] = Math.abs(restX);
      view[5] = Math.abs(numY);
      view[6] = Math.abs(restY);

      return view;
    }
    return null;
  }
}
