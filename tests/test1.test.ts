import { RootFlexBox } from "../lib/minimal-flexbox"
import { describe, it, expect } from "bun:test"
import { convertFlexBoxToSvg } from "./fixtures/convertFlexBoxToSvg"

it("should correctly layout a single child", () => {
  // Create a root container
  const root = new RootFlexBox(100, 50) // 100px wide, 50px high

  // Add a single child. By default, it should stretch in the cross axis
  // and its main size will be determined by flex properties.
  // With default flexGrow: 0, flexShrink: 1, flexBasis: 0,
  // and no other children, it should take up available space if no basis is set.
  // However, the current implementation resolves flexBasis first.
  // If we give it flexGrow: 1, it should take up the full width.
  const child = root.addChild({ flexGrow: 1, id: "child1" })

  // Compute the layout
  root.build()

  // Assertions
  // The child should occupy the full width of the container
  expect(child.size.width).toBe(100)
  // The child should occupy the full height due to align-items: stretch (default)
  expect(child.size.height).toBe(50)
  // The child should be positioned at (0,0)
  expect(child.position.x).toBe(0)
  expect(child.position.y).toBe(0)

  expect(convertFlexBoxToSvg(root)).toMatchSvgSnapshot(import.meta.path)
})
