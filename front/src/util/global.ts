import User from "../model/User";

export const APP = () => document.getElementById("app") as HTMLDivElement;
export const canvas = document.createElement("canvas");
export const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
export const units: Map<number, User> = new Map();
export const SPEED = {
  UNIT: 5,
};
export const SIZE = {
  UNIT: 30,
  BLOCK: 50,
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
