export const DEGREES_TO_RADIANS = Math.PI / 180;
export const RADIANS_TO_DEGREES = 180 / Math.PI

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);