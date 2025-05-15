import { it, expect } from "bun:test"
import { flexBoxLayout, type FlexBoxItem } from "../lib/flexBoxLayout"
import type { FlexBoxOptions } from "../lib/minimal-flexbox" // For casting FlexBoxOptions
import {
  getSvgFromGraphicsObject,
  type GraphicsObject,
  type Line,
  type Rect,
} from "graphics-debug"

// Copied from tests/fixtures/convertFlexBoxToSvg.ts for consistent coloring
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

it("should correctly layout a comprehensive nested structure using flexBoxLayout", () => {
  const comprehensiveLayoutInput: FlexBoxItem = {
    id: "root",
    width: 500,
    height: 300,
    flexGrow: 0, // Style for root if it were a child (not directly used by RootFlexBox itself)
    flexShrink: 1,
    flexBasis: 0,
    // Spread FlexBoxOptions for the root container.
    // Cast to Partial<FlexBoxOptions> to satisfy TypeScript when adding to FlexBoxItem.
    ...({
      direction: "row",
      alignItems: "stretch",
      justifyContent: "flex-start",
      columnGap: 10,
      rowGap: 5, // This gap would apply if root direction was 'column'
    } as Partial<FlexBoxOptions>),
    children: [
      {
        id: "childA", // This item is a flex child AND a flex container
        flexGrow: 1, // As a child of 'root', it grows to take available width
        flexShrink: 1,
        flexBasis: 0,
        height: 100, // Explicit cross-axis size (root is 'row', so height is cross)
        // Spread FlexBoxOptions for the 'childA' container
        ...({
          direction: "column",
          alignItems: "center",
          justifyContent: "space-between",
          rowGap: 5, // Gap between gcA1 and gcA2
        } as Partial<FlexBoxOptions>),
        children: [
          {
            id: "gcA1",
            flexGrow: 0,
            flexShrink: 1,
            flexBasis: 50, // Main axis (column for childA) is height
            width: 50, // Cross axis size for gcA1
          },
          {
            id: "gcA2",
            flexGrow: 1, // Takes remaining height in childA
            flexShrink: 1,
            flexBasis: 0,
            width: 30, // Cross axis size for gcA2
          },
        ],
      },
      {
        id: "childB", // This item is a flex child (leaf)
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: 100, // Main axis size (width, as root is 'row')
        alignSelf: "stretch", // Stretches to root's height (300)
      },
      {
        id: "childC", // This item is a flex child AND a flex container
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: 150, // Main axis size (width)
        // alignSelf defaults to 'auto', inherits 'stretch' from root, so height is 300
        // Spread FlexBoxOptions for the 'childC' container
        ...({
          direction: "row",
          justifyContent: "space-around",
          alignItems: "flex-end",
          columnGap: 5, // Gap between gcC1 and gcC2
        } as Partial<FlexBoxOptions>),
        children: [
          {
            id: "gcC1",
            flexGrow: 0,
            flexShrink: 1,
            flexBasis: 20, // Main axis size (width, as childC is 'row')
            height: 20, // Cross axis size
          },
          {
            id: "gcC2",
            flexGrow: 1, // Takes remaining width in childC
            flexShrink: 1,
            flexBasis: 30,
            height: 30, // Cross axis size
          },
        ],
      },
    ],
  }

  const layoutMap = flexBoxLayout(comprehensiveLayoutInput)

  const rects: Rect[] = []
  const lines: Line[] = []

  // Create a border for the root container
  const rootWidth = comprehensiveLayoutInput.width ?? 0
  const rootHeight = comprehensiveLayoutInput.height ?? 0
  lines.push({
    points: [
      { x: 0, y: 0 },
      { x: rootWidth, y: 0 },
      { x: rootWidth, y: rootHeight },
      { x: 0, y: rootHeight },
      { x: 0, y: 0 },
    ],
    strokeColor: "black",
    strokeWidth: 1,
  })

  let colorsUsed = 0
  for (const id in layoutMap) {
    const item = layoutMap[id]
    if (!item) continue
    rects.push({
      center: {
        x: item.position.x + item.size.width / 2,
        y: item.position.y + item.size.height / 2,
      },
      width: item.size.width,
      height: item.size.height,
      label: id,
      fill: COLORS[colorsUsed % COLORS.length],
      stroke: "black",
    })
    colorsUsed++
  }

  const graphicsObject: GraphicsObject = {
    lines,
    rects,
    title: "FlexBoxLayout Comprehensive Test",
    coordinateSystem: "cartesian",
  }

  const svgOptions = {
    backgroundColor: "white",
    includeTextLabels: true,
  }

  const svg = getSvgFromGraphicsObject(graphicsObject, svgOptions)
  expect(svg).toMatchSvgSnapshot(
    import.meta.path,
    "flexBoxLayout-comprehensive-layout",
  )
})
