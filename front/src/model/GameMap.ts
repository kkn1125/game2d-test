import { ctx, SIZE } from "../util/global";

export default class GameMap {
  id: number;
  name: string;
  binary: number[][];

  constructor(row: number = 10, column: number = 10) {
    this.binary = new Array(row)
      .fill(0)
      .map(() => new Array(column).fill(0).map((c, i) => 0));
    console.log(this.binary);
  }

  render() {
    this.binary.forEach((row, ri) => {
      row.forEach((column, ci) => {
        const rowGap = ri * SIZE.BLOCK;
        const columnGap = ci * SIZE.BLOCK;
        ctx.fillRect(columnGap, rowGap * SIZE.BLOCK, SIZE.BLOCK, SIZE.BLOCK);
      });
    });
  }
}
