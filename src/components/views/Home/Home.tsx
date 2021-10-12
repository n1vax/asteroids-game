import { useEffect, useRef } from "react"
import Vector2 from "@lib/Vector2";
import { clamp } from "@lib/utils/math";
import Random from "@lib/Random";
import Game from "@lib/Game";

interface Props { }

const generatePolygon = (
  center: Vector2,
  radius: number,
  irregularity: number,
  spikiness: number,
  numOfVertices: number
) => {
  irregularity = clamp(irregularity, 0, 1) * 2 * Math.PI / numOfVertices;
  spikiness = clamp(spikiness, 0, 1) * radius;

  const min = (2 * Math.PI / numOfVertices) - irregularity;
  const max = (2 * Math.PI / numOfVertices) + irregularity;
  let sum = 0;

  let angleSteps = Array.from({ length: numOfVertices }, () => {
    const value = Random.get(min, max);

    sum += value;

    return value;
  });

  const k = sum / (2 * Math.PI);

  angleSteps = angleSteps.map((v) => v / k);

  let angle = Random.get(0, 2 * Math.PI);

  const vertices = angleSteps.map((angleStep) => {
    const value = Random.get(0, 2 * radius);

    const x = center.x + value * Math.cos(angle);
    const y = center.y + value * Math.sin(angle);

    angle += angleStep;

    return new Vector2(x, y);
  });

  return vertices;
}

const Home = (props: Props) => {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasElRef.current!;
    const game = new Game(canvasEl);

    return () => {
      game.destroy();
    }
  }, []);

  return (
    <div className="app">
      <canvas className="canvas" ref={canvasElRef} />
    </div>
  )
}

export default Home
