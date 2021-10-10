import Size, { ISize } from "./Size";
import Vector2 from "./Vector2";

// export class RendererResizeObserver {
//   private _lastElSize: Size;
//   private _shouldResize: boolean;

//   constructor(
//     public readonly renderer: Renderer
//   ) {
//     this._lastElSize = renderer.getElSize();
//     this._shouldResize = false;

//     this._handleWindowResize = this._handleWindowResize.bind(this);

//     this.init();
//   }

//   init() {
//     window.addEventListener("resize", this._handleWindowResize);
//   }

//   destroy() {
//     window.removeEventListener("resize", this._handleWindowResize);
//   }

//   private _handleWindowResize(): void {
//     const elSize = this.renderer.getElSize();

//     if (!this._lastElSize.isEqual(elSize)) {
//       this._shouldResize = true;
//       this._lastElSize = elSize;
//     }
//   }

//   update(): void {
//     if (this._shouldResize) {
//       this.renderer.resize(this._lastElSize);

//       this._shouldResize = false;
//     }
//   }
// }

class Renderer {
  static readonly DPR: number = window.devicePixelRatio;

  public readonly ctx: CanvasRenderingContext2D;
  public readonly el: HTMLCanvasElement;

  private _lastElSize: Size;
  private _shouldUpdateSize: boolean;

  constructor(
    canvasEl: HTMLCanvasElement
  ) {
    this.el = canvasEl;
    this.ctx = this.el.getContext("2d")!;
    this._handleWindowResize = this._handleWindowResize.bind(this);
    this._lastElSize = this.getElSize();
    this._shouldUpdateSize = true;

    this.init();
  }

  init() {
    this.update();

    window.addEventListener("resize", this._handleWindowResize);
  }

  destroy() {
    window.removeEventListener("resize", this._handleWindowResize);
  }

  private _handleWindowResize(): void {
    const elSize = this.getElSize();

    if (!this._lastElSize.isEqual(elSize)) {
      this._shouldUpdateSize = true;
      this._lastElSize = elSize;
    }
  }

  update(): void {
    if (this._shouldUpdateSize) {
      this.resize(this._lastElSize);

      this._shouldUpdateSize = false;
    } else {
      this.clear();
    }
  }

  getElSize(): Size {
    return new Size(this.el.offsetWidth, this.el.offsetHeight);
  }

  getSize(): Size {
    return new Size(this.el.width, this.el.height);
  }

  get width(): number {
    return this.el.width;
  }

  get height(): number {
    return this.el.height;
  }

  get center(): Vector2 {
    return new Vector2(this.width / 2, this.height / 2);
  }

  resize(size: number | ISize = this.getElSize()) {
    this.el.width = (typeof size === "number" ? size : size.width) * Renderer.DPR;
    this.el.height = (typeof size === "number" ? size : size.height) * Renderer.DPR;
  }

  clear(): void {
    this.ctx.clearRect(
      0,
      0,
      this.el.width,
      this.el.height
    );
  }
}

export default Renderer;