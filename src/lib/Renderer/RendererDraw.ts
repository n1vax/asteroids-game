import Size, { ISize } from "@lib/Size";
import { countDigits } from "@lib/utils/math";
import Vector2, { IVector2 } from "@lib/Vector2";
import Renderer from "./Renderer";

interface DrawShapeStyle {
  fill?: string;
  stroke?: {
    color?: string;
    width?: number
  }
}

interface StrokeStyle {
  fill?: string;
  width?: number
}

interface DrawLine {
  (): void;
  (xAndY: number): void;
  (v: IVector2 | [number, number]): void;
  (x: number, y: number): void;
  (x?: number | IVector2 | [number, number], y?: number): void
}

interface IRendererDraw {
  moveTo: DrawLine,
  lineTo: DrawLine
}

class RendererDraw implements IRendererDraw {
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

  moveTo(x?: number | IVector2 | [number, number], y?: number): void {
    // console.log("moveto");
    [x, y] = this.toPoint(x, y);

    this._renderer.ctx.moveTo(x, y);
  }

  toPoint(
    x: number | IVector2 | [number, number] | undefined,
    y?: number | undefined
  ): [number, number] {
    if (Array.isArray(x)) {
      [x, y] = x;
    } else if (typeof x === "number") {
      y = typeof y === "number" ? y : x;
    } else if (Vector2.isVector2Like(x)) {
      ({ x, y } = x);
    } else {
      y = 0;
      x = 0;
    }

    // return [x, y];
    return [x, y];
  }

  lineTo(x?: number | IVector2 | [number, number], y?: number) {
    [x, y] = this.toPoint(x, y);

    this._renderer.ctx.lineTo(x, y);
  }

  grid(size: number, {
    alpha = 0.2,
    color = "#000"
  }: {
    alpha?: number,
    color?: string
  } = { alpha: 0.2, color: "#000" }) {
    const boundary = this._renderer.size;

    this._renderer.ctx.save();

    this._renderer.ctx.globalAlpha = alpha;

    for (let x = size, max = boundary.width; x < max; x += size) {
      this.line(
        [x, 0],
        [x, boundary.height],
        {
          fill: color
        }
      )
    }

    for (let y = size, max = boundary.height; y < max; y += size) {
      this.line(
        [0, y],
        [boundary.width, y],
        {
          fill: color
        }
      )
    }

    this._renderer.ctx.restore();

  }

  line(
    start: IVector2 | [number, number],
    end: IVector2 | [number, number],
    {
      fill = "#000",
      width = 1
    }: StrokeStyle = {
        fill: "#000",
        width: 1
      }
  ) {
    const { ctx } = this._renderer;
    const startPoint = this.toPoint(start);
    const endPoint = this.toPoint(end);

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = fill;
    ctx.moveTo(
      this.fixLineWidthBoundaryMismatch(startPoint[0], width),
      this.fixLineWidthBoundaryMismatch(startPoint[1], width)
    )
    ctx.lineTo(
      this.fixLineWidthBoundaryMismatch(endPoint[0], width),
      this.fixLineWidthBoundaryMismatch(endPoint[1], width)
    )
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  path(points: ([number, number] | IVector2)[]): void;
  path(draw: (draw: RendererDraw) => void): void;
  path(pointsOrDraw: ((draw: RendererDraw) => void) | ([number, number] | IVector2)[]) {
    this._renderer.ctx.beginPath();

    if (Array.isArray(pointsOrDraw)) {
      this.moveTo(pointsOrDraw[0]);

      for (let i = 1; i < pointsOrDraw.length; ++i) {
        this.lineTo(pointsOrDraw[i]);
      }
    } else {
      pointsOrDraw(this);
    }

    this._renderer.ctx.closePath();
  }

  fixLineWidthBoundaryMismatch(px: number, lineWidth: number) {
    const halfLineWidth = lineWidth / 2;
    const start = px - halfLineWidth;
    const end = px + halfLineWidth;
    const fixStart = Math.floor(start) - start;
    const fixEnd = Math.ceil(end) - end;
    const fix = Math.abs(fixStart) > Math.abs(fixEnd) ? fixEnd : fixStart;

    return px + fix;
  }

  fixPxBoundaryMismatch(px: number, lineWidth?: number) {
    // const strokeWidthHalf = strokeWidth / 2;
    // const startStrokeX = num - strokeWidthHalf;
    // const endStrokeX = num + strokeWidthHalf;
    // const startXFloored = Math.floor(startStrokeX);
    // const endXCeiled = Math.ceil(endStrokeX);

    // const fixLeft = startXFloored - startStrokeX;
    // const fixRight = endXCeiled - endStrokeX;

    // // x += ((Math.ceil(endStrokeX) - Math.floor(startStrokeX)) - strokeWidth) / 2
    // const fix = Math.abs(fixLeft) > Math.abs(fixRight) ? fixRight : fixLeft;// (Math.ceil(endStrokeX) - endStrokeX);
  }

  fixNum(num: number) {
    const strokeWidth = 4;//this._renderer.ctx.lineWidth;

    // console.log(strokeWidth);
    const strokeWidthHalf = strokeWidth / 2;
    const startStrokeX = num - strokeWidthHalf;
    const endStrokeX = num + strokeWidthHalf;
    const startXFloored = Math.floor(startStrokeX);
    const endXCeiled = Math.ceil(endStrokeX);

    const fixLeft = startXFloored - startStrokeX;
    const fixRight = endXCeiled - endStrokeX;

    // x += ((Math.ceil(endStrokeX) - Math.floor(startStrokeX)) - strokeWidth) / 2
    const fix = Math.abs(fixLeft) > Math.abs(fixRight) ? fixRight : fixLeft;// (Math.ceil(endStrokeX) - endStrokeX);

    return num //+ fix;
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