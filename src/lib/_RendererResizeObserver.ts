import Renderer from "./Renderer";
import Size from "./Size";

export class RendererResizeObserver {
  private _lastElSize: Size;
  private _shouldResize: boolean;

  constructor(
    public readonly renderer: Renderer
  ) {
    this._lastElSize = renderer.getElSize();
    this._shouldResize = false;

    this._handleWindowResize = this._handleWindowResize.bind(this);

    this.init();
  }

  init() {
    window.addEventListener("resize", this._handleWindowResize);
  }

  destroy() {
    window.removeEventListener("resize", this._handleWindowResize);
  }

  private _handleWindowResize(): void {
    const elSize = this.renderer.getElSize();

    if (!this._lastElSize.isEqual(elSize)) {
      this._shouldResize = true;
      this._lastElSize = elSize;
    }
  }

  update(): void {
    if (this._shouldResize) {
      this.renderer.resize(this._lastElSize);

      this._shouldResize = false;
    }
  }
}

export default RendererResizeObserver;