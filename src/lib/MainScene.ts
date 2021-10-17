import Scene from "./Scene";
import Asteroid from "./Asteroid";
import GameLoop from "./GameLoop";
import Matrix2D from "./Matrix2D";
import Random from "./Random";
import Renderer from "./Renderer/Renderer";
import Shape2D from "./Shape2D";
import Size from "./Size";
import UserInput from "./UserInput";
import { DEGREES_TO_RADIANS, TWO_PI } from "./utils/math";
import Vector2 from "./Vector2";
import Game from "./Game";
import GameObject from "./GameObject";


interface SpaceshipProperties {

}

enum SpaceshipControls {
  ROTATE_LEFT,
  ROTATE_RIGHT,
  MOVE_FORWARD
}

class Spaceship extends GameObject {
  private _size: Size = new Size(100, 100);
  public readonly position: Vector2 = Vector2.zero;
  // private _position: Vector2 = new Vector2(0);
  private _velocity: Vector2 = Vector2.zero;
  private _maxSpeed: number = 2000;
  private _rotationSpeed: number = 200;
  private _accelerationSpeed: number = 10;
  private _direction: Vector2 = Vector2.top;

  private _rotationDirection: number = 0;
  private _applyAcceleration: boolean = false;

  public readonly shape: Shape2D;
  public readonly rhomb: Shape2D;
  public readonly rect: Shape2D;

  private _maxTailSegments: number = 100;
  private _tailSegments: Vector2[] = [];

  constructor(game: Game, properties?: {
    position: Vector2,
    size: Size,
    acceleration: number,
    maxSpeed: number,
    rotationSpeed: number,
    direction: Vector2
  }) {
    super(game);

    const bottomLength = this._size.height / 3;
    const topLength = this._size.height - bottomLength;



    const rhombSize = new Size(12, 24);

    this.shape = new Shape2D([
      new Vector2(0, -topLength),
      new Vector2(-this._size.width / 2, bottomLength),
      new Vector2(0, bottomLength / 2),
      new Vector2(this._size.width / 2, bottomLength)
    ]);

    this.rhomb = new Shape2D([
      new Vector2(0, rhombSize.height / -2),
      new Vector2(rhombSize.width / 2, rhombSize.height / 4),
      new Vector2(0, rhombSize.height / 2),
      new Vector2(rhombSize.width / -2, rhombSize.height / 4),
    ]);

    this.rect = new Shape2D([
      new Vector2(rhombSize.width / -2, 0),
      new Vector2(rhombSize.width / 2, 0),
      new Vector2(rhombSize.width / 2, rhombSize.height),
      new Vector2(rhombSize.width / -2, rhombSize.height),
    ]);
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

    const maxSpeed = this._maxSpeed * mspf;

    if (this._velocity.magnitude > maxSpeed) {
      this._velocity.magnitude = maxSpeed;
    }

    // if (this._tailSegments.length >= this._maxTailSegments) {
    //   // console.log(this._tailSegments);
    //   this._tailSegments.shift();
    // }

    this._tailSegments.push(this.position.clone());


    this.position.add(this._velocity);
  }

  renderBody() {
    const { draw, ctx } = this.game.renderer;

    const bodyMatrix = Matrix2D.transform(
      this.position,
      this._direction.angle()
    );

    const bodyVertices = this.shape.vertices.map(vector => {
      return bodyMatrix.multiply(vector);
    });

    const rad45Deg = Math.PI / 4;

    draw.applyStyles({
      stroke: {
        color: "#fff",
        width: 2
      }
    },
      () => {
        draw.path(() => {
          draw.moveTo(bodyVertices[0]);

          for (let i = 1; i < bodyVertices.length; ++i) {
            const vertex = bodyVertices[i];

            if (i === 2) {
              draw.arc(
                this.position,
                18,
                this._direction.angle(true) - Math.PI - rad45Deg,
                this._direction.angle(true) + rad45Deg
              )
            } else {
              draw.lineTo(vertex)
            }
          }
        });
      });
  }

  renderCore() {
    const { ctx, draw, width, height } = this.game.renderer;

    const asteroidDrawerStyle = {
      stroke: {
        color: "#fff",
        width: 2
      }
    }

    const angle = this._velocity.x === 0 && this._velocity.y === 0 ?
      this._direction.angle() :
      this._velocity.angle();

    const rhombMatrix = Matrix2D.transform(
      this.position,
      angle
    );

    const rhombVertices = this.rhomb.vertices.map(vector => {
      return rhombMatrix.multiply(vector);
    });

    const rectMatrix = Matrix2D.compose(
      Matrix2D.rotateAt(angle, rhombVertices[0]),
      Matrix2D.translate(rhombVertices[0]),
      Matrix2D.scale({
        x: 1,
        y: this._velocity.magnitude / (this._maxSpeed * this.game.gameLoop.mspf)
      })
    )

    const rectVertices = this.rect.vertices.map(vector => {
      return rectMatrix.multiply(vector);
    })

    ctx.save();
    ctx.beginPath();

    draw.moveTo(rhombVertices[0]);
    for (let i = 1; i < rhombVertices.length; ++i) {
      draw.lineTo(rhombVertices[i]);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.clip();

    ctx.beginPath();
    draw.moveTo(rectVertices[0]);
    for (let i = 0; i < rectVertices.length; ++i) {
      draw.lineTo(rectVertices[i]);
    }

    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    draw.applyStyles(asteroidDrawerStyle, () => {
      draw.path(rhombVertices);
    })
  }

  render() {
    const { ctx, origin } = this.game.renderer;

    // ctx.resetTransform();

    this.renderBody();
    this.renderCore();
  }
}


class MainScene extends Scene {
  public entities: GameObject[] = [];
  public spaceship = new Spaceship(this.game);

  init() {
    this.entities.push(this.spaceship);

    // console.log(this.game.renderer.ctx);

    // this.callScenes("init");
    // this.asteroidPolygon = Asteroid.generateVertices({
    //   spikiness: 0,
    //   maxRadius: 100,
    //   maxSpikeSize: 10,
    //   numOfVertices: 10
    // });
  }

  destroy() {
    this.entities = [];
  }

  update() {
    this.entities.forEach(entity => entity.update());
  }

  renderAxis(position: Vector2 = Vector2.zero) {
    const { draw, width, origin, height, boundary } = this.game.renderer;

    let vx = 0;

    if (position.x > boundary.end.x) {
      vx = position.x - boundary.end.x;
    } else if (position.x < boundary.start.x) {
      vx = position.x - boundary.start.x
    }

    draw.verticalLine(
      [vx, position.y - origin.y],
      height,
      {
        style: {
          fill: "rgba(0, 255, 0, 0.5)",
          width: 2
        }
      });

    let hy = 0;

    if (position.y > boundary.end.y) {
      hy = position.y - boundary.end.y;
    } else if (position.y < boundary.start.y) {
      hy = position.y - boundary.start.y
    }

    draw.horizontalLine(
      [position.x - origin.x, hy],
      width,
      {
        style: {
          fill: "rgba(255, 0, 0, 0.5)",
          width: 2
        }
      });
  }

  cameraFollow(vector: Vector2) {
    const { ctx, origin } = this.game.renderer;

    ctx.resetTransform();

    const cameraPosition = new Vector2(origin).sub(vector);

    ctx.translate(
      +cameraPosition.x.toFixed(2),
      +cameraPosition.y.toFixed(2)
    );

    ctx.scale(
      this.game.renderer.dpr,
      this.game.renderer.dpr,
    );
  }

  render() {

    this.game.renderer.background("#000");

    const { draw, origin, width } = this.game.renderer;

    this.cameraFollow(this.spaceship.position);
    this.renderAxis(this.spaceship.position);

    draw.grid(this.spaceship.position, 10, {
      color: "#fff",
      opacity: 0.05
    });

    draw.grid(this.spaceship.position, 50, {
      color: "#fff",
      opacity: 0.1
    });

    this.entities.forEach(entity => entity.render());
  }
}

export default MainScene;