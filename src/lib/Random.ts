class Random {
  public static get(): number;
  public static get(min: number, max: number): number;
  public static get(min?: number, max?: number): number {
    let random = Math.random();

    if (typeof min === "number" && typeof max === "number") {
      random *= (max - min) + min;
    }

    return random;
  }
}

export default Random;