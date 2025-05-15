import {
  getSvgFromGraphicsObject,
  type GraphicsObject,
  type Line,
  type Rect,
  type TransformOptions,
} from "graphics-debug"
import type { RootFlexBox } from "../../lib/minimal-flexbox"

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
  opts?: { title?: string },
): string {
  const layout = root.getLayout()
  const rects: Rect[] = []
  const lines: Line[] = []

  // Create a line that goes around the border
  //   root.size.width
  lines.push({
    // Five points
    points: [
      // Top left
      { x: root.position.x, y: root.position.y },
      // Top right
      { x: root.position.x + root.size.width, y: root.position.y },
      // Bottom right
      {
        x: root.position.x + root.size.width,
        y: root.position.y + root.size.height,
      },
      // Bottom left
      { x: root.position.x, y: root.position.y + root.size.height },
      // Top left
      { x: root.position.x, y: root.position.y },
    ],
    strokeColor: "black",
    strokeWidth: 1,
  })

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
      fill: COLORS[colorsUsed % COLORS.length], // Ensure colorsUsed wraps around
      stroke: "black",
    })
    colorsUsed++
  }

  const graphicsObject: GraphicsObject = {
    lines,
    rects,
    // Use title from transformOptions if provided for the graphics object itself,
    // otherwise default. getSvgFromGraphicsObject might also use its own options.title.
    title: opts?.title ?? "FlexBox Layout",
    coordinateSystem: "cartesian",
  }

  // Merge default options with provided transformOptions
  // User-provided options (transformOptions) will override defaults or add new ones.
  const finalTransformOptions = {
    backgroundColor: "white",
    includeTextLabels: true,
  }

  return getSvgFromGraphicsObject(graphicsObject, finalTransformOptions)
}
