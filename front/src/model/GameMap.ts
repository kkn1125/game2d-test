import { COLOR, ctx, master, SCALE, SIZE, SPEED } from "../util/global";
import User from "./User";

export default class GameMap {
  id: number;
  name: string;
  binary: number[][];

  constructor(row: number = 10, column: number = 10) {
    this.binary =
      /* [
      [0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [0, 1, 0, 1, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 0, 0, 1, 0],
      [0, 0, 0, 1, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]; */
      this.convertToMap(`
    0 1 0 0 0 0 1 0 0 0
    0 1 0 1 1 1 1 0 1 1
    0 1 0 1 0 0 0 0 1 0
    0 1 1 1 1 1 0 0 1 0
    0 0 0 1 0 1 1 1 1 0
    0 0 0 1 0 0 0 1 0 0
    0 0 1 1 1 0 1 1 1 1
    0 0 1 0 1 0 1 0 0 0
    1 1 1 0 1 0 1 0 0 0
    0 0 0 0 1 0 1 0 0 0
    `);
  }

  convertToMap(strMap: string) {
    return strMap
      .trim()
      .split(/[\n]+/)
      .map((row) =>
        row
          .trim()
          .replace(/[\s]+/g, "")
          .split("")
          .map((column) => Number(column))
      );
  }

  collision() {
    const BLOCK_SIZE = SCALE.RATIO * SIZE.BLOCK * SCALE.MAP_VALUE;
    const UNIT_SIZE = SCALE.RATIO * SIZE.UNIT * SCALE.MAP_VALUE;
    const MAP_HEIGHT = this.binary.length * BLOCK_SIZE;
    const MAP_WIDTH = this.binary[0].length * BLOCK_SIZE;
    const MAP_CENTER_VALUE_X = innerWidth / 2 - MAP_WIDTH / 2;
    const MAP_CENTER_VALUE_Y = innerHeight / 2 - MAP_HEIGHT / 2;
    const GAP_UNIT_X = master.me.x * SCALE.UNIT * SCALE.RATIO;
    const GAP_UNIT_Y = master.me.y * SCALE.UNIT * SCALE.RATIO;
    const currentIndex = Math.floor(
      (GAP_UNIT_X - MAP_CENTER_VALUE_X + innerWidth / 2 + UNIT_SIZE / 2) /
        BLOCK_SIZE
    );

    this.binary.forEach((row, ri) => {
      row.forEach((column, ci) => {
        const rowGap = ri * BLOCK_SIZE - UNIT_SIZE / 2;
        const columnGap = ci * BLOCK_SIZE - UNIT_SIZE / 2;

        if (master.me instanceof User) {
          // if (
          //   columnGap + MAP_CENTER_VALUE_X - GAP_UNIT_X + BLOCK_SIZE >
          //     innerWidth / 2 &&
          //   columnGap +
          //     MAP_CENTER_VALUE_X -
          //     GAP_UNIT_X -
          //     SCALE.RATIO * SCALE.UNIT * 2 <
          //     innerWidth / 2 &&
          //   rowGap + MAP_CENTER_VALUE_Y - GAP_UNIT_Y + BLOCK_SIZE >
          //     innerHeight / 2 &&
          //   rowGap +
          //     MAP_CENTER_VALUE_Y -
          //     GAP_UNIT_Y -
          //     SCALE.RATIO * SCALE.UNIT * 2 <
          //     innerHeight / 2
          // ) {
          //   master.me.color = COLOR.WARN;
          // } else {
          //   master.me.color = COLOR.UNIT;
          // }
          
        }
      });
    });
  }

  render() {
    const BLOCK_SIZE = SCALE.RATIO * SIZE.BLOCK * SCALE.MAP_VALUE;
    const UNIT_SIZE = SCALE.RATIO * SIZE.UNIT * SCALE.MAP_VALUE;
    const MAP_HEIGHT = this.binary.length * BLOCK_SIZE;
    const MAP_WIDTH = this.binary[0].length * BLOCK_SIZE;
    const MAP_CENTER_VALUE_X = innerWidth / 2 - MAP_WIDTH / 2;
    const MAP_CENTER_VALUE_Y = innerHeight / 2 - MAP_HEIGHT / 2;
    const GAP_UNIT_X = master.me.x * SCALE.UNIT * SCALE.RATIO;
    const GAP_UNIT_Y = master.me.y * SCALE.UNIT * SCALE.RATIO;

    this.binary.forEach((row, ri) => {
      row.forEach((column, ci) => {
        const rowGap = ri * BLOCK_SIZE - UNIT_SIZE / 2;
        const columnGap = ci * BLOCK_SIZE - UNIT_SIZE / 2;
        // const GAP_HEIGHT = MAP_HEIGHT / 4;
        // const GAP_WIDTH = MAP_WIDTH / 4;

        if (column === 0) {
          ctx.fillStyle = COLOR.BLOCK;
          ctx.fillRect(
            columnGap + MAP_CENTER_VALUE_X - GAP_UNIT_X,
            rowGap + MAP_CENTER_VALUE_Y - GAP_UNIT_Y,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        } else if (column === 1) {
          ctx.fillStyle = COLOR.ROAD;
          ctx.fillRect(
            columnGap + MAP_CENTER_VALUE_X - GAP_UNIT_X,
            rowGap + MAP_CENTER_VALUE_Y - GAP_UNIT_Y,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      });
    });
  }
}
