import {
  getSvgFromGraphicsObject,
  GraphicsObject,
  Rect,
  TransformOptions,
} from "graphics-debug"
import { RootFlexBox } from "../../lib/index"

export function convertFlexBoxToSvg(
  root: RootFlexBox,
  options?: TransformOptions,
): string {
  const layout = root.getLayout()
  const rects: Rect[] = []
  console.log(layout)

  for (const id in layout) {
    const item = layout[id]
    if (!item) continue
    rects.push({
      center: {
        x: item.position.x + item.size.width / 2,
        y: item.position.y + item.size.height / 2,
      },
      width: item.size.width,
      height: item.size.height,
      label: id,
      fill: "rgba(0,0,0,0.1)",
      stroke: "black",
    })
  }

  const graphicsObject: GraphicsObject = {
    rects,
    title: "FlexBox Layout",
    coordinateSystem: "cartesian",
  }

  return getSvgFromGraphicsObject(graphicsObject, {
    backgroundColor: "white",
    includeTextLabels: true,
  })
}
