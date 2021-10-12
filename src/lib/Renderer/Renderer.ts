import RendererResizeObserver from "./RendererResizeObserver";
import Size, { ISize } from "../Size";
import { IVector2 } from "../Vector2";
import RendererDraw from "./RendererDraw";

export interface RendererOptions {
  dpr?: number;
}

class Renderer {
  public readonly ctx: CanvasRenderingContext2D;
  public readonly resizeObserver: RendererResizeObserver;
  public readonly draw: RendererDraw;

  private _dpr: number = 1;


  constructor(
    public readonly el: HTMLCanvasElement,
    options?: RendererOptions
  ) {
    const _options = {
      dpr: window.devicePixelRatio,
      ...options
    }

    this.ctx = this.el.getContext("2d")!;
    this._dpr = _options.dpr;
    this.resizeObserver = new RendererResizeObserver(this);
    this.draw = new RendererDraw(this);
  }

  destroy() {
    this.resizeObserver.destroy();
  }

  get dpr(): number {
    return this._dpr;
  }

  get size(): Size {
    return new Size(
      this.el.offsetWidth,
      this.el.offsetHeight
    );
  }

  get intrinsicSize(): Size {
    return new Size(
      this.el.width,
      this.el.height
    );
  }

  set intrinsicSize(size: number | ISize) {
    this.el.width = this._dpr * (typeof size === "number" ? size : size.width);
    this.el.height = this._dpr * (typeof size === "number" ? size : size.height);
  }

  get width(): number {
    return this.el.width;
  }

  get height(): number {
    return this.el.height;
  }

  get center(): IVector2 {
    return {
      x: this.width / 2,
      y: this.height / 2
    }
  }

  clear(): void {
    this.ctx.clearRect(
      0,
      0,
      this.el.width,
      this.el.height
    );
  }

  background(color: string) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      0,
      0,
      this.el.width * this.dpr,
      this.el.height * this.dpr
    )
    this.ctx.restore();
  }
}

export default Renderer;