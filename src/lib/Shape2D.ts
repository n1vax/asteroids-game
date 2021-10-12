import Vector2 from "./Vector2";

class Shape2D {
  public path: [number, number][] = [];

  constructor(path: [number, number][]) {
    this.path = path.map(pathItem => [...pathItem]);
  }

  rotate(degrees: number): this {


    return this;
  }

  scale(value: number): this {
    return this;
  }

  translate(position: Vector2): this {
    this.path = this.path.map(([x, y]) => {
      return [x + position.x, y + position.y]
    });

    return this;
  }

  clear() {
    this.path = [];
  }
}

export default Shape2D;