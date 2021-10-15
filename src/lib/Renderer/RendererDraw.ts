import Size, { ISize } from "@lib/Size";
import { countDigits } from "@lib/utils/math";
import Vector2, { Vector2Object } from "@lib/Vector2";
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
  (v: Vector2Object | [number, number]): void;
  (x: number, y: number): void;
  (x?: number | Vector2Object | [number, number], y?: number): void
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




  polygon(points: Vector2Object[], styles?: DrawShapeStyle) {
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

  moveTo(x?: number | Vector2Object | [number, number], y?: number): void {

    [x, y] = this.toPoint(x, y);


    this._renderer.ctx.moveTo(x, y);
  }

  toPoint(
    x: number | Vector2Object | [number, number] | undefined,
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

    return [+x.toFixed(2), +y.toFixed(2)];
  }

  lineTo(x?: number | Vector2Object | [number, number], y?: number) {
    [x, y] = this.toPoint(x, y);

    this._renderer.ctx.lineTo(x, y);
  }

  grid(size: number, {
    opacity = 0.2,
    color = "#000"
  }: {
    opacity?: number,
    color?: string
  } = { opacity: 0.2, color: "#000" }) {
    const { start, end } = this._renderer.boundary;

    this._renderer.ctx.save();

    this._renderer.ctx.globalAlpha = opacity;

    for (let x = 0, max = end.x; x < max; x += size) {
      this.line([x, start.y], [x, end.y], { fill: color })

      if (x !== 0) {
        this.line([-x, start.y], [-x, end.y], { fill: color })
      }
    }

    for (let y = 0, max = end.y; y < max; y += size) {
      this.line([start.x, y], [end.x, y], { fill: color })

      if (y !== 0) {
        this.line([start.x, -y], [end.x, -y], { fill: color })
      }
    }

    this._renderer.ctx.restore();

  }

  line(
    start: Vector2Object | [number, number],
    end: Vector2Object | [number, number],
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

  path(points: ([number, number] | Vector2Object)[]): void;
  path(draw: (draw: RendererDraw) => void): void;
  path(pointsOrDraw: ((draw: RendererDraw) => void) | ([number, number] | Vector2Object)[]) {
    const { ctx } = this._renderer;
    ctx.beginPath();

    if (Array.isArray(pointsOrDraw)) {
      this.moveTo(pointsOrDraw[0]);

      for (let i = 1; i < pointsOrDraw.length; ++i) {
        this.lineTo(pointsOrDraw[i]);
      }
    } else {
      pointsOrDraw(this);
    }

    ctx.closePath();
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
    position: Vector2Object,
    radius: number,
    startAngle: number = 0,
    engAngle: number = Math.PI * 2
  ) {
    this._renderer.ctx.arc(
      position.x,
      position.y,
      radius,
      startAngle,
      engAngle
    );
  }

  circle(position: Vector2Object, radius: number) {
    const { ctx } = this._renderer;

    ctx.beginPath();
    this.arc(position, radius);
    ctx.closePath();
  }


  rect(position: Vector2Object, size: ISize) {
    this._renderer.ctx.rect(
      position.x,
      position.y,
      size.width,
      size.height
    );
  }
}

export default RendererDraw;