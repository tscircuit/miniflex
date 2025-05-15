import {
  getSvgFromGraphicsObject,
  type GraphicsObject,
  type Rect,
  type TransformOptions,
} from "graphics-debug"
import type { RootFlexBox } from "../../lib/index"

const COLORS = [
  "rgba(0,0,0,0.1)",
  "rgba(255,0,0,0.1)", // Red
  "rgba(0,255,0,0.1)", // Green
  "rgba(0,0,255,0.1)", // Blue
  "rgba(255,255,0,0.1)", // Yellow
  "rgba(255,0,255,0.1)", // Magenta
  "rgba(0,255,255,0.1)", // Cyan
  "rgba(255,165,0,0.1)", // Orange
  "rgba(128,0,128,0.1)", // Purple
  "rgba(0,128,0,0.1)", // Dark Green
  "rgba(128,0,0,0.1)", // Maroon
  "rgba(0,0,128,0.1)", // Navy
  "rgba(128,128,0,0.1)", // Olive
  "rgba(139,69,19,0.1)", // Brown
  "rgba(70,130,180,0.1)", // Steel Blue
]

export function convertFlexBoxToSvg(
  root: RootFlexBox,
  options?: TransformOptions,
): string {
  const layout = root.getLayout()
  const rects: Rect[] = []

  let colorsUsed = 0
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
      fill: COLORS[colorsUsed++],
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
