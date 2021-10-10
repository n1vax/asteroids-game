export type AnimationLoopCallback = () => void;

class AnimationLoop {
  private _rafId: number = -1;
  private _startTime: number = 0;
  private _lastUpdate: number = 0;
  private _fps: number = 240;
  private _updateDelay: number = 1000 / this._fps;
  private _callback?: AnimationLoopCallback;

  private _runtime: number = 0;
  private _delta: number = 0;

  constructor() {
    this._loop = this._loop.bind(this);
  }

  private _loop() {
    const currentTime = this._getTime();
    this._runtime = currentTime - this._startTime;
    this._delta = currentTime - this._lastUpdate;

    if (this._delta > this._updateDelay) {
      this._lastUpdate = currentTime;

      if (this._callback) {
        this._callback();
      }
    }

    this._rafId = requestAnimationFrame(this._loop);
  }

  private _getTime() {
    return Date.now();
  }

  get delta() {
    return this._delta / 1000;
  }

  get runtime() {
    return this._runtime / 1000;
  }

  public init(callback: AnimationLoopCallback) {
    let currentTime = this._getTime();

    this._startTime = currentTime;
    this._lastUpdate = currentTime;
    this._callback = callback;

    this._rafId = requestAnimationFrame(this._loop);
  }

  public destroy() {
    cancelAnimationFrame(this._rafId);
  }
}

export default AnimationLoop;