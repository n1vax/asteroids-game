import Asteroid from "./Asteroid";
import GameLoop from "./GameLoop";
import MainScene from "./MainScene";
import Matrix from "./Matrix";
import Random from "./Random";
import Renderer from "./Renderer/Renderer";
import Scene from "./Scene";
import Shape2D from "./Shape2D";
import Size from "./Size";
import UserInput from "./UserInput";
import { DEGREES_TO_RADIANS, TWO_PI } from "./utils/math";
import Vector2 from "./Vector2";

class Game {
  public readonly renderer: Renderer;
  public readonly gameLoop: GameLoop;
  public readonly userInput: UserInput;
  public activeSceneName: keyof (typeof this.scenes) = "main";
  public readonly scenes: {
    main: MainScene
  };
  private _activeScene: typeof this.scenes[typeof this.activeSceneName];

  public grid: ([number, number])[] = [];
  public asteroidPolygon: Vector2[] = [];
  public debugObj: { [key: string]: any } = {}

  constructor(public readonly canvasEl: HTMLCanvasElement) {
    this._update = this._update.bind(this);
    this._render = this._render.bind(this);

    this.renderer = new Renderer(canvasEl);
    this.userInput = new UserInput();
    this.gameLoop = new GameLoop({
      update: this._update,
      render: this._render
    });

    this.scenes = {
      main: new MainScene(this)
    }

    this._activeScene = this.scenes[this.activeSceneName];

    this.init();
  }

  init() {
    this._activeScene.init();
  }

  callScenes(method: "init" | "destroy") {
    const { scenes } = this;

    let scene: keyof (typeof scenes);

    for (scene in scenes) {
      scenes[scene][method]();
    }
  }

  destroy() {
    this.gameLoop.destroy();
    this.renderer.destroy();
    this.userInput.destroy();

    this._activeScene.destroy();
  }

  getScene<S extends typeof this.activeSceneName>(sceneName: S): typeof this.scenes[S] {
    return this.scenes[sceneName];
  }

  setActiveScene(sceneName: (typeof this.activeSceneName)) {
    this._activeScene.destroy();

    const scene = this._activeScene = this.getScene(this.activeSceneName = sceneName);

    scene.init();
  }

  public regenerateAsteroid(props: Parameters<typeof Asteroid.generateVertices>[0]) {
    this.asteroidPolygon = Asteroid.generateVertices(props);
  }

  private _update() {
    this._activeScene.update();
  }

  private _render() {
    this.renderer.update();
    this.renderer.background("#000");

    const { draw, ctx, center, width, height } = this.renderer;

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

    this._activeScene.render();
  }
}

export default Game;