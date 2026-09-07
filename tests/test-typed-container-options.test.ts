import { expect, it } from "bun:test"
import { flexBoxLayout, type FlexBoxItem } from "../lib"

it("accepts and applies typed root and nested container options", () => {
  const tree: FlexBoxItem = {
    width: 200,
    height: 100,
    flexBasis: 0,
    flexGrow: 0,
    flexShrink: 1,
    direction: "row",
    columnGap: 10,
    rowGap: 3,
    justifyContent: "center",
    alignItems: "stretch",
    children: [
      {
        id: "nested",
        flexBasis: 80,
        flexGrow: 0,
        flexShrink: 1,
        direction: "column",
        columnGap: 3,
        rowGap: 10,
        justifyContent: "flex-end",
        alignItems: "center",
        children: [
          { id: "a", flexBasis: 20, flexGrow: 0, flexShrink: 1, width: 20 },
          { id: "b", flexBasis: 30, flexGrow: 0, flexShrink: 1, width: 30 },
        ],
      },
      { id: "tail", flexBasis: 40, flexGrow: 0, flexShrink: 1 },
    ],
  }

  const layout = flexBoxLayout(tree)
  expect(layout.nested).toEqual({
    position: { x: 35, y: 0 },
    size: { width: 80, height: 100 },
  })
  expect(layout.tail).toEqual({
    position: { x: 125, y: 0 },
    size: { width: 40, height: 100 },
  })
  expect(layout.a).toEqual({
    position: { x: 30, y: 40 },
    size: { width: 20, height: 20 },
  })
  expect(layout.b).toEqual({
    position: { x: 25, y: 70 },
    size: { width: 30, height: 30 },
  })
})
