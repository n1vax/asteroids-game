import { TWO_PI } from "./utils/math";

class Random {
  public static get(): number;
  public static get(min: number, max: number): number;
  public static get(min?: number, max?: number): number {
    let random = Math.random();

    if (typeof min === "number" && typeof max === "number") {
      random = random * (max - min) + min;
    }

    return random;
  }


  private static GAUSS_SPARE: number | null = null;

  // https://en.wikipedia.org/wiki/Marsaglia_polar_method
  public static gauss(mean: number = 0, stdDev: number = 1): number {
    let value = 0;

    if (Random.GAUSS_SPARE !== null) {
      value = Random.GAUSS_SPARE;

      Random.GAUSS_SPARE = null;
    } else {
      let u = 0;
      let v = 0;
      let s = 0;

      do {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
        s = u * u + v * v;
      } while (s >= 1 || s === 0);

      s = Math.sqrt(-2 * Math.log(s) / s);

      Random.GAUSS_SPARE = v * s;

      value = u * s;
    }

    // console.log(value);

    return value * stdDev + mean;
  }

  // https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform#Basic_form
  // public static boxMullerTransform(mean: number = 0, sigma: number = 1): [number, number] {
  //   let u1 = 0;
  //   let u2 = 0;

  //   while (u1 === 0) {
  //     u1 = Math.random();
  //   }

  //   while (u2 === 0) {
  //     u2 = Math.random();
  //   }

  //   const mag = sigma * Math.sqrt(-2 * Math.log(u1));
  //   const x = mag * Math.cos(TWO_PI * u2) + mean;
  //   const y = mag * Math.sin(TWO_PI * u2) + mean;

  //   return [x, y];
  // }
}

export default Random;