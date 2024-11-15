import { Graphics } from "@pixi/react";

export function Circle() {
  return (
    <Graphics
      draw={(g) => {
        g.clear();
        g.beginFill(0xff0000);
        g.drawCircle(50, 50, 20);
        g.endFill();
      }}
    />
  );
}
