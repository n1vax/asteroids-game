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
      const accelerationSpeed = 1;
      const rotationSpeed = 200;
      const maxSpeed = 200;

      let rotateDirection = 0;
      let position = renderer.center;
      let velocity = Vector2.zero;
      let lookAt = Vector2.top;

      let shouldApplyAcceleration = false;

      const handleInput = () => {
        if (userInput.pressedKeys.KeyD) {
          rotateDirection = 1;
        } else if (userInput.pressedKeys.KeyA) {
          rotateDirection = -1;
        } else {
          rotateDirection = 0;
        }

        shouldApplyAcceleration = userInput.pressedKeys.KeyW;
      }

      const updatePosition = () => {
        if (rotateDirection !== 0) {
          lookAt.rotate(
            rotateDirection *
            rotationSpeed *
            animationLoop.delta
          );
        }

        if (shouldApplyAcceleration) {
          const acceleration = lookAt.clone().multiply(accelerationSpeed * animationLoop.delta);

          velocity.add(acceleration);
        }


        const maxDeltaSpeed = maxSpeed * animationLoop.delta;

        if (velocity.magnitude > maxDeltaSpeed) {
          velocity.magnitude = maxDeltaSpeed;
        }

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

      const debugStyles = {
        stroke: {
          color: "red",
          width: 1
        }
      }

      const drawSpaceship = (
        p = position,
      ) => {

        drawer.circle(p, 2, {
          fill: "red"
        });

        // velocity direction
        drawer.applyStyles(debugStyles, ({ ctx }) => {
          ctx.translate(p.x, p.y);

          drawer.line(
            Vector2.zero,
            velocity.normalized.multiply(velocity.magnitude * 10)
          )
        });

        // looking direction
        drawer.applyStyles({
          stroke: {
            width: 1,
            color: "blue"
          }
        }, ({ ctx }) => {
          ctx.translate(p.x, p.y);

          drawer.line(
            Vector2.zero,
            lookAt.clone().multiply(size.height)
          )
        });

        drawer.applyStyles(asteroidDrawerStyle, ({ ctx }) => {
          const bottomLength = size.height / 3;
          const topLength = size.height - bottomLength;

          const angle = lookAt.angle(true);

          const r0 = [Math.cos(angle), -Math.sin(angle)];
          const r1 = [Math.sin(angle), Math.cos(angle)];

          const a = new Vector2(p.x, p.y - topLength);
          const b = new Vector2(p.x + size.width / 2, p.y + bottomLength);
          const c = new Vector2(p.x - size.width / 2, p.y + bottomLength);

          const rp = p;

          const center = new Vector2(
            rp.x - r0[0] * rp.x - r0[1] * rp.y,
            rp.y - r1[0] * rp.x - r1[1] * rp.y
          );

          ctx.beginPath();

          drawer.moveTo(new Vector2(
            r0[0] * a.x + r0[1] * a.y + center.x,
            r1[0] * a.x + r1[1] * a.y + center.y
          ));
          drawer.lineTo(new Vector2(
            r0[0] * b.x + r0[1] * b.y + center.x,
            r1[0] * b.x + r1[1] * b.y + center.y
          ));
          drawer.lineTo(new Vector2(
            r0[0] * c.x + r0[1] * c.y + center.x,
            r1[0] * c.x + r1[1] * c.y + center.y
          ));

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
        handleInput();
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
