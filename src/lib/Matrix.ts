import Vector2, { Vector2Like, Vector2Object } from "./Vector2";

class Matrix {
  constructor(
    private a: number = 1,
    private b: number = 0,
    private c: number = 0,
    private d: number = 1,
    private tx: number = 0,
    private ty: number = 0
  ) { };

  translate(vector: Vector2): this {
    this.tx += vector.x;
    this.ty += vector.y;

    return this;
  }

  rotate() {

  }

  multiply(matrix: Matrix): Matrix;
  multiply(vector: Vector2): Vector2;
  multiply(mOrV: Vector2 | Matrix): Vector2 | Matrix {
    if (mOrV instanceof Vector2) {
      const vector = mOrV;

      return new Vector2(
        this.a * vector.x + this.b * vector.y + this.tx,
        this.c * vector.x + this.d * vector.y + this.ty
      );
    }

    const matrix = mOrV;

    return new Matrix(
      this.a * matrix.a + this.b * matrix.c, // a
      this.a * matrix.b + this.d * matrix.c, // b
      this.c * matrix.a + this.d * matrix.c, // c
      this.c * matrix.b + this.d * matrix.d, // d
      this.a * matrix.tx + this.b * matrix.ty, // tx
      this.c * matrix.tx + this.d * matrix.ty // tx
    )
  }

  scale(scaling: Vector2Object, pivot: Vector2Object): Matrix {
    return Matrix.translated(pivot).multiply(Matrix.scaled(scaling)).multiply(Matrix.translated(new Vector2(pivot).invert()));
  }

  static transformed(position: Vector2, radians: number, scaling: number | Vector2Object = 1) {
    scaling = Vector2.toObject(scaling);

    return new Matrix(
      Math.cos(radians) * scaling.x, -Math.sin(radians) * scaling.x,
      Math.sin(radians) * scaling.y, Math.cos(radians) * scaling.y,
      position.x, position.y
    );
  }

  static translated(vector: Vector2Object) {
    return new Matrix(
      1, 0,
      0, 1,
      vector.x, vector.y
    );
  }

  static rotated(radians: number) {
    return new Matrix(
      Math.cos(radians), -Math.sin(radians),
      Math.sin(radians), Math.cos(radians),
      0, 0
    );
  }

  static scaled(scaling: Vector2Object) {
    return new Matrix(
      1 * scaling.x, 0,
      0, 1 * scaling.y,
      0, 0
    );
  }
}

export default Matrix;