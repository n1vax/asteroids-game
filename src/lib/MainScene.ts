import Scene from "./Scene";
import Asteroid from "./Asteroid";
import GameLoop from "./GameLoop";
import Matrix from "./Matrix";
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
  private _position: Vector2 = Vector2.zero;
  // private _position: Vector2 = new Vector2(0);
  private _velocity: Vector2 = Vector2.zero;
  private _maxSpeed: number = 200;
  private _rotationSpeed: number = 200;
  private _accelerationSpeed: number = 1;
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

    const a = new Vector2(0, -topLength);
    const b = new Vector2(-this._size.width / 2, bottomLength);
    const c = new Vector2(0, bottomLength / 2);
    const d = new Vector2(this._size.width / 2, bottomLength);

    this.shape = new Shape2D([
      a,
      b,
      c,
      d
    ]);
    this.rhomb = new Shape2D([
      new Vector2(0, 12),
      new Vector2(6, 0),
      new Vector2(0, -12),
      new Vector2(-6, 0)
    ]);

    this.rect = new Shape2D([
      new Vector2(-6, -6),
      new Vector2(6, -6),
      new Vector2(6, 6),
      new Vector2(-6, 6)
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

    const maxDeltaSpeed = this._maxSpeed * mspf;

    if (this._velocity.magnitude > maxDeltaSpeed) {
      this._velocity.magnitude = maxDeltaSpeed;
    }

    if (this._tailSegments.length >= this._maxTailSegments) {
      // console.log(this._tailSegments);
      this._tailSegments.shift();
    }

    this._tailSegments.push(this._position.clone());


    this._position.add(this._velocity);
  }

  render() {
    const { ctx, draw } = this.game.renderer;
    const asteroidDrawerStyle = {
      stroke: {
        color: "#fff",
        width: 1
      }


    }

    const debugStyles = {
      stroke: {
        color: "red",
        width: 2
      }
    }

    const matrix = Matrix.transformed(
      this._position,
      this._direction.angle(true)
    );

    const rhombMatrix = Matrix.transformed(
      this._position,
      this._velocity.angle(true)
    );

    const rhombVertices = this.rhomb.vertices.map(vector => {
      return rhombMatrix.multiply(vector);
    });


    const rectMatrix = Matrix.transformed(
      this._position,
      this._velocity.angle(true)
    ).scale({
      x: 1,
      y: 1
    }, this._velocity.normalized.multiply(6));

    const bodyVertices = this.shape.vertices.map(vector => {
      return matrix.multiply(vector);
    })



    const rectVertices = this.rect.vertices.map(vector => {
      return rectMatrix.multiply(vector);
    })


    const rad45Deg = Math.PI / 4;
    // body
    draw.applyStyles(asteroidDrawerStyle, () => {
      draw.path(() => {
        draw.moveTo(bodyVertices[0]);

        for (let i = 1; i < bodyVertices.length; ++i) {
          const vertex = bodyVertices[i];

          if (i === 2) {
            draw.arc(
              this._position,
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

    draw.applyStyles(asteroidDrawerStyle, () => {
      draw.path(rhombVertices);
    })
    // speed;

    ctx.save();

    ctx.save();
    ctx.fillStyle = "#fff";

    ctx.beginPath();

    draw.moveTo(rhombVertices[0]);
    for (let i = 1; i < rhombVertices.length; ++i) {
      draw.lineTo(rhombVertices[i]);
    }
    ctx.clip();

    // ctx.beginPath();
    draw.moveTo(rectVertices[0]);
    for (let i = 0; i < rectVertices.length; ++i) {
      draw.lineTo(rectVertices[i]);
    }

    ctx.fill();
    ctx.closePath();
    ctx.restore();

    // renderer.draw.circle(this._position, 2);

    // looking direction
    // draw.applyStyles(asteroidDrawerStyle, () => {
    //   // renderer.ctx.translate(this._position.x, this._position.y);
    //   draw.path([
    //     this._position,
    //     this._direction.clone().multiply(this._size.height / 3 * 2).add(this._position)
    //   ]
    //   )
    // });

    // velocity direction
    // draw.applyStyles(debugStyles, () => {
    //   ctx.beginPath();
    //   draw.arc(this._position.clone().add(this._velocity.normalized.multiply(12)), 2);
    //   ctx.closePath();
    //   ctx.fill();
    // });
    // velocity direction
    draw.applyStyles(debugStyles, () => {
      draw.arc(this._position.clone().add(this._velocity.normalized.multiply(6)), 5);

      ctx.translate(this._position.x, this._position.y);

      draw.line(
        Vector2.zero,
        this._velocity
          .normalized
          .multiply(
            this._velocity.magnitude * 10
          )
      )
    });

    // tail
    // renderer.ctx.save();
    // renderer.ctx.strokeStyle = "red";
    // renderer.ctx.lineWidth = 5;
    // renderer.ctx.lineCap = "round";
    // renderer.ctx.lineJoin = "round";

    // renderer.ctx.beginPath();

    // renderer.draw.moveTo(this._tailSegments[0]);

    // for (let i = 1; i < this._tailSegments.length; ++i) {
    //   renderer.draw.lineTo(this._tailSegments[i]);
    // }
    // renderer.ctx.stroke();
    // renderer.ctx.restore();
  }
}


class MainScene extends Scene {
  public entities: GameObject[] = [];

  init() {
    this.entities.push(new Spaceship(this.game));

    // this.callScenes("init");
    // this.asteroidPolygon = Asteroid.generateVertices({
    //   spikiness: 0,
    //   maxRadius: 100,
    //   maxSpikeSize: 10,
    //   numOfVertices: 10
    // });
  }

  update() {
    this.entities.forEach(entity => entity.update());
  }

  render() {
    const { draw, ctx, center, width, height } = this.game.renderer;

    draw.grid(10, {
      color: "#fff",
      opacity: 0.05
    });

    draw.grid(50, {
      color: "#fff",
      opacity: 0.1
    });

    draw.line([0, -height / 2], [0, height / 2], {
      fill: "rgba(0, 255, 0, 0.5)",
      width: 1
    });
    draw.line([-width / 2, 0], [width / 2, 0], {
      fill: "rgba(255, 0, 0, 0.5)"
    });

    // ctx.save();
    // ctx.strokeStyle = "#fff";
    // ctx.lineWidth = 1;
    // draw.path(this.asteroidPolygon);
    // ctx.stroke();
    // ctx.restore();

    // ctx.save();
    // ctx.fillStyle = "white";
    // const lineHeight = 12;
    // this.asteroidPolygon.forEach(({ x, y }, i) => {
    //   ctx.fillText(`№ ${i}`, x + 2, y - lineHeight * 2 - 2);
    //   ctx.fillText(`x:${x.toFixed(2)}`, x + 2, y - lineHeight - 2);
    //   ctx.fillText(`y:${y.toFixed(2)}`, x + 2, y - 2);

    //   ctx.save();
    //   draw.circle({ x, y }, 2);
    //   ctx.fillStyle = "red";
    //   ctx.fill();
    //   ctx.restore();
    // });
    // ctx.restore();

    this.entities.forEach(entity => entity.render());
  }
}

export default MainScene;