import { DEGREES_TO_RADIANS, RADIANS_TO_DEGREES } from "./helpers/constatns";

export interface IVector2 {
  x: number;
  y: number;
}

class Vector2 implements IVector2 {
  public x: number;
  public y: number;

  static get zero(): Vector2 { return new Vector2(0); }
  static get one(): Vector2 { return new Vector2(1); }
  static get left(): Vector2 { return new Vector2(-1, 0); }
  static get right(): Vector2 { return new Vector2(1, 0); }
  static get top(): Vector2 { return new Vector2(0, -1); }
  static get bottom(): Vector2 { return new Vector2(0, 1); }

  constructor();
  constructor(xAndY: number);
  constructor(v: IVector2);
  constructor(x: number, y: number);
  constructor(xyv?: number | IVector2, y?: number) {
    if (typeof xyv === "number") {
      this.x = xyv;
      this.y = typeof y === "number" ? y : xyv;
    } else if (Vector2.isVector2Like(xyv)) {
      this.x = xyv.x;
      this.y = xyv.y
    } else {
      this.x = 0;
      this.y = 0;
    }
  }

  set(xAndY: number): this;
  set(v: Vector2 | IVector2): this;
  set(xyv: number | Vector2 | IVector2, y?: number): this {
    if (typeof xyv === "number") {
      this.x = xyv;
      this.y = typeof y === "number" ? y : xyv;
    } else if (Vector2.isVector2Like(xyv)) {
      this.x = xyv.x;
      this.y = xyv.y
    }

    return this;
  }

  static isVector2Like(v: any): v is IVector2 {
    return (
      typeof v === "object" &&
      typeof v.x === "number" &&
      typeof v.y === "number"
    )
  }

  invert(): this {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  }

  add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  sub(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  multiply(v: number | Vector2): this {
    if (typeof v === "number") {
      this.x *= v;
      this.y *= v;
    } else {
      this.x *= v.x;
      this.y *= v.y;
    }

    return this;
  }

  crossProduct(v: Vector2): number {
    return this.x * v.y - this.y * v.x;
  }

  clone(): Vector2 {
    return new Vector2(this);
  }

  distance(v: Vector2): number {
    const x = this.x - v.x;
    const y = this.y - v.y;

    return Math.hypot(x, y);
  }

  get magnitude() {
    return Math.hypot(this.x, this.y);
  }

  set magnitude(newMagnitude: number) {
    this.normalize().multiply(newMagnitude);
  }

  angle(radians?: boolean) {
    const angle = Math.PI - Math.atan2(this.x, this.y);

    return radians ? angle : angle * RADIANS_TO_DEGREES;
  }

  rotate(value: number, isRadians?: boolean) {
    const radians = isRadians ? value : value * DEGREES_TO_RADIANS;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const x = cos * this.x - sin * this.y;
    const y = sin * this.x + cos * this.y;

    this.x = x;
    this.y = y;

    return this;
  }

  normalize(): this {
    const m = this.magnitude;

    if (m > 0) {
      this.multiply(1 / m);
    }

    return this;
  }

  toArray(): [number, number] {
    return [this.x, this.y]
  }

  get normalized(): Vector2 {
    return new Vector2(this).normalize();
  }
}

export default Vector2;