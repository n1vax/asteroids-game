import Size, { ISize } from "./Size";
import Vector2, { IVector2 } from "./Vector2";

interface DrawerShapeStyle {
  fill?: string;
  stroke?: {
    color?: string;
    width?: number
  }
}

class Drawer {
  public readonly ctx: CanvasRenderingContext2D;
  private readonly _dpr: number;

  constructor(
    public readonly canvasEl: HTMLCanvasElement
  ) {
    this.ctx = canvasEl.getContext("2d")!;
    this._dpr = window.devicePixelRatio;
  }

  applyStyles(styles: DrawerShapeStyle = { fill: "#000" }, draw: (drawer: Drawer) => void) {
    this.ctx.save();

    draw(this);

    if (styles.fill) {
      this.ctx.fillStyle = styles.fill;
      this.ctx.fill()
    }

    if (styles.stroke) {
      const { color, width } = styles.stroke;

      if (color) {
        this.ctx.strokeStyle = color;
      }

      if (width) {
        this.ctx.lineWidth = width;
      }


      this.ctx.stroke()
    }

    this.ctx.restore();
  }

  circle(position: Vector2, radius: number, styles?: DrawerShapeStyle) {
    const drawCircle = () => {
      this.ctx.beginPath();
      this.arc(position, radius);
      this.ctx.closePath()
    }

    this.applyStyles(styles, drawCircle);
  }

  moveTo(p: Vector2) {
    this.ctx.moveTo(p.x, p.y);
  }

  lineTo(p: Vector2) {
    this.ctx.lineTo(p.x, p.y);
  }

  line(start: Vector2, end: Vector2, styles?: DrawerShapeStyle) {
    const drawLine = () => {
      this.ctx.beginPath();
      this.moveTo(start);
      this.lineTo(end);
      this.ctx.closePath()
    }

    this.applyStyles(styles, drawLine);
  }

  arc(
    position: IVector2,
    radius: number,
    startAngle: number = 0,
    engAngle: number = Math.PI * 2
  ) {
    this.ctx.arc(
      position.x * this._dpr,
      position.y * this._dpr,
      radius * this._dpr,
      startAngle,
      engAngle
    );
  }

  rect(position: IVector2, size: ISize) {
    this.ctx.rect(
      position.x * this._dpr,
      position.y * this._dpr,
      size.width * this._dpr,
      size.height * this._dpr
    );
  }

  background(color: string) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      0,
      0,
      this.canvasEl.width * this._dpr,
      this.canvasEl.height * this._dpr
    )
    this.ctx.restore();
  }
}

export default Drawer;