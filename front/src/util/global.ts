import User from "../model/User";

export const APP = () => document.getElementById("app") as HTMLDivElement;
export const canvas = document.createElement("canvas");
export const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
export const units: Map<number, User> = new Map();
export const SPEED = {
  UNIT: 5,
};
export const SCALE = {
  UNIT: 5,
  RATIO: 10,
  MAP_VALUE: 1.1,
  UNNIT_VALUE: 1,
};
export const SIZE = {
  UNIT: 3,
  BLOCK: 5,
};
export const joystick = {
  w: false,
  s: false,
  a: false,
  d: false,
};
export let master = {
  me: {} as User,
};
export const COLOR = {
  WARN: "#ff0000",
  NAME: "#000000",
  UNIT: "#ffff00",
  BLOCK: "#555555",
  ROAD: "#cccccc",
};
