import { RootFlexBox } from "../lib/minimal-flexbox"
import { it, expect } from "bun:test"
import { convertFlexBoxToSvg } from "./fixtures/convertFlexBoxToSvg"

const containerHeight = 50
const columnGap = 0 // Using 0 gap to simplify position assertions

it("should correctly layout three children with space-between", () => {
  const localContainerWidth = 400
  const c1Basis = 50
  const c2Basis = 70
  const c3Basis = 80
  // Total basis = 50 + 70 + 80 = 200
  // Remaining space = 400 - 200 = 200
  // For space-between with 3 children, space between each = 200 / (3 - 1) = 100

  const root = new RootFlexBox(localContainerWidth, containerHeight, {
    justifyContent: "space-between",
    columnGap,
    id: "root-3children-sb",
  })
  const child1 = root.addChild({ flexBasis: c1Basis, id: "c1_3_sb" })
  const child2 = root.addChild({ flexBasis: c2Basis, id: "c2_3_sb" })
  const child3 = root.addChild({ flexBasis: c3Basis, id: "c3_3_sb" })

  root.build()

  expect(child1.size.width).toBe(c1Basis)
  expect(child1.position.x).toBeCloseTo(0)

  expect(child2.size.width).toBe(c2Basis)
  expect(child2.position.x).toBeCloseTo(c1Basis + 100) // 50 + 100 = 150

  expect(child3.size.width).toBe(c3Basis)
  expect(child3.position.x).toBeCloseTo(c1Basis + 100 + c2Basis + 100) // 50 + 100 + 70 + 100 = 320

  expect(
    convertFlexBoxToSvg(root, {
      title: "Three Children, justify: space-between",
    }),
  ).toMatchSvgSnapshot(import.meta.path, "three-children-space-between")
})
