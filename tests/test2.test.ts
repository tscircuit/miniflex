import { RootFlexBox } from "../lib/minimal-flexbox"
import { describe, it, expect } from "bun:test"
import { convertFlexBoxToSvg } from "./fixtures/convertFlexBoxToSvg"

it("should correctly layout two children with flexGrow", () => {
  const root = new RootFlexBox(200, 100, { columnGap: 0 })
  const child1 = root.addChild({ flexGrow: 1 })
  const child2 = root.addChild({ flexGrow: 1 })

  root.build()

  expect(child1.size.width).toBe(100)
  expect(child1.position.x).toBe(0)
  expect(child2.size.width).toBe(100)
  expect(child2.position.x).toBe(100)

  expect(convertFlexBoxToSvg(root)).toMatchSvgSnapshot(import.meta.path)
})
