import { RootFlexBox, type Justify } from "../lib/index"
import { describe, it, expect } from "bun:test"
import { convertFlexBoxToSvg } from "./fixtures/convertFlexBoxToSvg"

describe("justifyContent with different sized children", () => {
  const containerWidth = 300
  const containerHeight = 50
  const child1Basis = 50
  const child2Basis = 100
  const columnGap = 0 // Using 0 gap to simplify position assertions

  // Expected positions [child1, child2]
  const testCases: Array<{
    justify: Justify
    expectedPositions: Array<{ x: number; y: number }>
    ids?: string[]
  }> = [
    {
      justify: "flex-start",
      expectedPositions: [
        { x: 0, y: 0 }, // child1
        { x: 50, y: 0 }, // child2 (starts after child1)
      ],
    },
    {
      justify: "flex-end",
      expectedPositions: [
        { x: containerWidth - (child1Basis + child2Basis), y: 0 }, // 300 - 150 = 150
        { x: containerWidth - child2Basis, y: 0 }, // 300 - 100 = 200
      ],
    },
    {
      justify: "center",
      expectedPositions: [
        { x: (containerWidth - (child1Basis + child2Basis)) / 2, y: 0 }, // (300 - 150) / 2 = 75
        { x: (containerWidth - (child1Basis + child2Basis)) / 2 + child1Basis, y: 0 }, // 75 + 50 = 125
      ],
    },
    {
      justify: "space-between",
      expectedPositions: [
        { x: 0, y: 0 },
        { x: containerWidth - child2Basis, y: 0 }, // child2 is at the end: 300 - 100 = 200
      ],
    },
    {
      justify: "space-around",
      expectedPositions: [
        // remainingSpace = 300 - (50+100) = 150. numChildren = 2. space = 150/2 = 75. leading = 75/2 = 37.5
        { x: 37.5, y: 0 },
        { x: 37.5 + child1Basis + 75, y: 0 }, // 37.5 + 50 + 75 = 162.5
      ],
    },
    {
      justify: "space-evenly",
      expectedPositions: [
        // remainingSpace = 150. numChildren = 2. space = 150/(2+1) = 50.
        { x: 50, y: 0 },
        { x: 50 + child1Basis + 50, y: 0 }, // 50 + 50 + 50 = 150
      ],
    },
  ]

  for (const { justify, expectedPositions } of testCases) {
    it(`should correctly layout two children with ${justify}`, () => {
      const root = new RootFlexBox(containerWidth, containerHeight, {
        justifyContent: justify,
        columnGap,
        id: `root-${justify}`,
      })
      const child1 = root.addChild({ flexBasis: child1Basis, id: `c1-${justify}` })
      const child2 = root.addChild({ flexBasis: child2Basis, id: `c2-${justify}` })

      root.build()

      expect(child1.size.width).toBe(child1Basis)
      expect(child1.position.x).toBeCloseTo(expectedPositions[0].x)
      expect(child1.position.y).toBeCloseTo(expectedPositions[0].y)

      expect(child2.size.width).toBe(child2Basis)
      expect(child2.position.x).toBeCloseTo(expectedPositions[1].x)
      expect(child2.position.y).toBeCloseTo(expectedPositions[1].y)

      expect(
        convertFlexBoxToSvg(root, { title: `Two Children, justify: ${justify}` }),
      ).toMatchSvgSnapshot(import.meta.path, `two-children-${justify}`)
    })
  }

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
      convertFlexBoxToSvg(root, { title: "Three Children, justify: space-between" }),
    ).toMatchSvgSnapshot(import.meta.path, "three-children-space-between")
  })
})
