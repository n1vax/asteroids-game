import Size, { ISize } from "@lib/Size";
import Vector2, { IVector2 } from "@lib/Vector2";
import Renderer from "./Renderer";

interface DrawShapeStyle {
  fill?: string;
  stroke?: {
    color?: string;
    width?: number
  }
}

class RendererDraw {
  private readonly _renderer: Renderer

  constructor(
    renderer: Renderer
  ) {
    this._renderer = renderer;
  }

  applyStyles(styles: DrawShapeStyle = { fill: "#000" }, draw: (drawer: RendererDraw) => void) {
    this._renderer.ctx.save();

    draw(this);

    if (styles.fill) {
      this._renderer.ctx.fillStyle = styles.fill;
      this._renderer.ctx.fill()
    }

    if (styles.stroke) {
      const { color, width } = styles.stroke;

      if (color) {
        this._renderer.ctx.strokeStyle = color;
      }

      if (width) {
        this._renderer.ctx.lineWidth = width;
      }


      this._renderer.ctx.stroke()
    }

    this._renderer.ctx.restore();
  }

  polygon(points: IVector2[], styles?: DrawShapeStyle) {
    const drawPolygon = () => {
      this._renderer.ctx.beginPath();
      this.moveTo(points[0]);

      for (let i = 1; i < points.length; ++i) {
        this.lineTo(points[i]);
      }

      this._renderer.ctx.closePath()
    }

    this.applyStyles(styles, drawPolygon);
  }

  circle(position: IVector2, radius: number, styles?: DrawShapeStyle) {
    const drawCircle = () => {
      this._renderer.ctx.beginPath();
      this.arc(position, radius);
      this._renderer.ctx.closePath()
    }

    this.applyStyles(styles, drawCircle);
  }

  moveTo(p: IVector2) {
    this._renderer.ctx.moveTo(p.x, p.y);
  }

  lineTo(p: IVector2) {
    this._renderer.ctx.lineTo(p.x, p.y);
  }

  line(start: IVector2, end: IVector2, styles?: DrawShapeStyle) {
    const drawLine = () => {
      this._renderer.ctx.beginPath();
      this.moveTo(start);
      this.lineTo(end);
      this._renderer.ctx.closePath()
    }

    this.applyStyles(styles, drawLine);
  }

  arc(
    position: IVector2,
    radius: number,
    startAngle: number = 0,
    engAngle: number = Math.PI * 2
  ) {
    this._renderer.ctx.arc(
      position.x * this._renderer.dpr,
      position.y * this._renderer.dpr,
      radius * this._renderer.dpr,
      startAngle,
      engAngle
    );
  }

  rect(position: IVector2, size: ISize) {
    this._renderer.ctx.rect(
      position.x * this._renderer.dpr,
      position.y * this._renderer.dpr,
      size.width * this._renderer.dpr,
      size.height * this._renderer.dpr
    );
  }
}

export default RendererDraw;