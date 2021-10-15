import Game from "./Game";

abstract class GameObject {
  public isActive: boolean = false;

  constructor(public readonly game: Game) { }

  init() { };
  destroy() { };

  abstract update(): void;
  abstract render(): void;
}


export default GameObject;