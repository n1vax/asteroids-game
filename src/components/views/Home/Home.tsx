import UserInput from "@lib/UserInput";
import { useEffect, useRef } from "react"
import AnimationLoop, { AnimationLoopCallback } from "@lib/AnimationLoop";
import Drawer from "@lib/Drawer";
import Display from "@lib/Renderer";
// import { TextureShapeCircle } from "@lib/Texture";
import Vector2 from "@lib/Vector2";
import Size from "@lib/Size";
import { DEGREES_TO_RADIANS, RADIANS_TO_DEGREES } from "@lib/helpers/constatns";

interface Props {

}



class Spaceship {
  constructor(
    public position: Vector2 = new Vector2(),
    public velocity: Vector2 = new Vector2()
  ) {

  }
}

interface Entity {
  update(): void;
}

const Home = (props: Props) => {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasElRef.current!;
    const renderer = new Display(canvasEl);
    const drawer = new Drawer(canvasEl);
    const animationLoop = new AnimationLoop();
    const userInput = new UserInput();

    const createAsteroid = (): Entity => {
      const size = new Size(50, 60);
      const maxAcceleration = 300;
      const accelerationSpeed = 5;

      let position = renderer.center;
      let velocity = Vector2.zero;
      let direction = Vector2.top;
      let acceleration = 0;

      const radius = 50;
      const rotationSpeed = 200;
      const moveSpeed = 300;

      const input = () => {
        if (userInput.pressedKeys.KeyD) {
          direction.rotate(rotationSpeed * animationLoop.delta)
        }

        if (userInput.pressedKeys.KeyA) {
          direction.rotate(-rotationSpeed * DEGREES_TO_RADIANS);
        }

        if (userInput.pressedKeys.KeyW) {
          acceleration += accelerationSpeed * animationLoop.delta;

          if (acceleration > maxAcceleration * animationLoop.delta) {
            acceleration = maxAcceleration * animationLoop.delta;
          }
        }

        if (userInput.pressedKeys.KeyS) {
          acceleration -= accelerationSpeed * animationLoop.delta;

          if (acceleration < 0) {
            acceleration = 0;
          }
        }

        velocity = new Vector2(direction).multiply(acceleration);
      }

      const updatePosition = () => {
        position.add(velocity);

        // if (
        //   position.x > renderer.width + radius
        // ) {
        //   const diff = position.x - (renderer.width + radius);

        //   position.x = 0 - radius + diff;
        // } else if (position.x < 0 - radius) {
        //   const diff = position.x - (0 - radius);

        //   position.x = renderer.width + radius - diff;
        // }

        // if (
        //   position.y > renderer.height + radius
        // ) {
        //   const diff = position.y - (renderer.height + radius);

        //   position.y = 0 - radius + diff;
        // } else if (position.y < 0 - radius) {
        //   const diff = position.y - (0 - radius);

        //   position.y = renderer.height + radius - diff;
        // }
      }

      const asteroidDrawerStyle = {
        stroke: {
          color: "#fff",
          width: 1
        }
      }

      const drawSpaceship = (
        p = position,
        r = radius,
        s = asteroidDrawerStyle
      ) => {

        drawer.circle(p, 2, {
          fill: "red"
        });

        drawer.applyStyles(asteroidDrawerStyle, ({ ctx }) => {
          ctx.translate(p.x, p.y);
          ctx.rotate(direction.angle(true));

          ctx.beginPath();

          ctx.moveTo(0, -2 * size.height / 3);
          ctx.lineTo(size.width / 2, size.height / 3);
          ctx.lineTo(-size.width / 2, size.height / 3);

          ctx.closePath();
        })
      }

      const render = () => {
        drawSpaceship();

        // if (position.x > renderer.width - radius) {
        //   const copyPosition = new Vector2(
        //     position.x - renderer.width,
        //     position.y
        //   );

        //   drawAsteroid(copyPosition);
        // }

        // if (position.x < 0 + radius) {
        //   const copyPosition = new Vector2(
        //     position.x + renderer.width,
        //     position.y
        //   );

        //   drawAsteroid(copyPosition);
        // }
      }

      const update = () => {
        input();
        updatePosition();
        render();
      }

      return {
        update,
      }
    }

    const entities: Entity[] = [createAsteroid()];

    animationLoop.init(() => {
      renderer.update();

      drawer.background("#000");

      entities.forEach(entity => entity.update());
    });

    return () => {
      animationLoop.destroy();
      renderer.destroy();
      userInput.destroy();
    }
  }, []);

  return (
    <div className="app">
      <canvas className="canvas" ref={canvasElRef} />
    </div>
  )
}

export default Home
