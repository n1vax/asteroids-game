import GameLoop from "./GameLoop";
import Renderer from "./Renderer/Renderer";
import Size from "./Size";
import UserInput from "./UserInput";
import Vector2 from "./Vector2";

abstract class GameEntityBase {
  constructor(public readonly game: Game) { }

  abstract update(): void;
  abstract render(): void;
}

interface SpaceshipProperties {

}

enum SpaceshipControls {
  ROTATE_LEFT,
  ROTATE_RIGHT,
  MOVE_FORWARD
}

class Spaceship extends GameEntityBase {
  private _size: Size = new Size(50, 60);
  private _position: Vector2 = new Vector2(this.game.renderer.center);
  private _velocity: Vector2 = Vector2.zero;
  private _maxSpeed: number = 200;
  private _rotationSpeed: number = 200;
  private _accelerationSpeed: number = 1;
  private _direction: Vector2 = Vector2.top;

  private _rotationDirection: number = 0;
  private _applyAcceleration: boolean = false;

  private controls: {
    [key: string]: SpaceshipControls
  } = {
      KeyW: SpaceshipControls.MOVE_FORWARD,
      KeyA: SpaceshipControls.ROTATE_LEFT,
      KeyD: SpaceshipControls.ROTATE_RIGHT
    }

  constructor(game: Game, properties?: {
    position: Vector2,
    size: Size,
    acceleration: number,
    maxSpeed: number,
    rotationSpeed: number,
    direction: Vector2
  }) {
    super(game);
  }

  input() {
    const { KeyW, KeyA, KeyD } = this.game.userInput.pressedKeys;

    if (KeyD) {
      this._rotationDirection = 1;
    } else if (KeyA) {
      this._rotationDirection = -1;
    } else {
      this._rotationDirection = 0;
    }

    this._applyAcceleration = KeyW;
  }

  update() {
    this.input();

    const { mspf } = this.game.gameLoop;
    if (this._rotationDirection !== 0) {
      this._direction.rotate(
        this._rotationDirection *
        this._rotationSpeed *
        mspf
      );
    }

    if (this._applyAcceleration) {
      const acceleration = new Vector2(this._direction).multiply(this._accelerationSpeed * mspf);

      this._velocity.add(acceleration);
    }


    const maxDeltaSpeed = this._maxSpeed * mspf;

    if (this._velocity.magnitude > maxDeltaSpeed) {
      this._velocity.magnitude = maxDeltaSpeed;
    }

    this._position.add(this._velocity);
  }

  render() {
    const { renderer } = this.game;
    const asteroidDrawerStyle = {
      stroke: {
        color: "#fff",
        width: 1
      }
    }

    const debugStyles = {
      stroke: {
        color: "red",
        width: 1
      }
    }

    renderer.draw.applyStyles(asteroidDrawerStyle, () => {
      const bottomLength = this._size.height / 3;
      const topLength = this._size.height - bottomLength;

      const angle = this._direction.angle(true);

      const r0 = [Math.cos(angle), -Math.sin(angle)];
      const r1 = [Math.sin(angle), Math.cos(angle)];

      const a = new Vector2(this._position.x, this._position.y - topLength);
      const b = new Vector2(this._position.x + this._size.width / 2, this._position.y + bottomLength);
      const c = new Vector2(this._position.x - this._size.width / 2, this._position.y + bottomLength);

      const rp = this._position;

      const center = new Vector2(
        rp.x - r0[0] * rp.x - r0[1] * rp.y,
        rp.y - r1[0] * rp.x - r1[1] * rp.y
      );

      renderer.draw.polygon([
        new Vector2(
          r0[0] * a.x + r0[1] * a.y + center.x,
          r1[0] * a.x + r1[1] * a.y + center.y
        ),
        new Vector2(
          r0[0] * b.x + r0[1] * b.y + center.x,
          r1[0] * b.x + r1[1] * b.y + center.y
        ),
        new Vector2(
          r0[0] * c.x + r0[1] * c.y + center.x,
          r1[0] * c.x + r1[1] * c.y + center.y
        )
      ])
    })


    renderer.draw.circle(this._position, 2, {
      fill: "red"
    });

    // looking direction
    renderer.draw.applyStyles(asteroidDrawerStyle, () => {
      renderer.ctx.translate(this._position.x, this._position.y);
      console.log("draw look line");
      renderer.draw.line(
        Vector2.zero,
        this._direction.clone().multiply(this._size.height / 3 * 2)
      )
    });

    // velocity direction
    renderer.draw.applyStyles(debugStyles, () => {
      renderer.ctx.translate(this._position.x, this._position.y);

      renderer.draw.line(
        Vector2.zero,
        this._velocity
          .normalized
          .multiply(
            this._velocity.magnitude * 10
          )
      )
    });

  }
}

class Game {
  public renderer: Renderer;
  public gameLoop: GameLoop;
  public userInput: UserInput;
  public entities: GameEntityBase[] = [];

  constructor(public readonly canvasEl: HTMLCanvasElement) {
    this._update = this._update.bind(this);
    this._render = this._render.bind(this);

    this.renderer = new Renderer(canvasEl);
    this.userInput = new UserInput();
    this.gameLoop = new GameLoop({
      update: this._update,
      render: this._render
    });

    this.init();
  }

  init() {
    this.entities.push(new Spaceship(this));
  }

  destroy() {
    this.gameLoop.destroy();
    this.renderer.destroy();
    this.userInput.destroy();
    this.entities = [];
  }

  private _update() {
    this.renderer.resizeObserver.update();
    this.renderer.background("#000");

    this.entities.forEach(entity => entity.update());
  }

  private _render() {
    this.entities.forEach(entity => entity.render());
  }
}

export default Game;