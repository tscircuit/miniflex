import { RootFlexBox, type Align, type FlexStyle } from "../lib/minimal-flexbox"
import { describe, it, expect } from "bun:test"
import { convertFlexBoxToSvg } from "./fixtures/convertFlexBoxToSvg"

const containerWidth = 300
const containerHeight = 200 // Cross axis size for row direction
const childBasis = 50 // Main axis size

describe("alignItems and alignSelf", () => {
  // Child 1: explicit height
  const child1Style: Partial<FlexStyle> = {
    flexBasis: childBasis,
    height: 30,
    id: "c1",
  }
  // Child 2: no explicit height
  const child2Style: Partial<FlexStyle> = { flexBasis: childBasis, id: "c2" }

  const testCases: Array<{
    alignItems: Align
    child2AlignSelf?: Align | "auto"
    expectedC1Y: number
    expectedC1Height: number
    expectedC2Y: number
    expectedC2Height: number
    idSuffix: string
  }> = [
    {
      alignItems: "flex-start",
      expectedC1Y: 0,
      expectedC1Height: 30,
      expectedC2Y: 0,
      expectedC2Height: 0, // No explicit height, not stretched
      idSuffix: "flex-start",
    },
    {
      alignItems: "center",
      expectedC1Y: (containerHeight - 30) / 2, // 85
      expectedC1Height: 30,
      expectedC2Y: (containerHeight - 0) / 2, // 100
      expectedC2Height: 0,
      idSuffix: "center",
    },
    {
      alignItems: "flex-end",
      expectedC1Y: containerHeight - 30, // 170
      expectedC1Height: 30,
      expectedC2Y: containerHeight - 0, // 200
      expectedC2Height: 0,
      idSuffix: "flex-end",
    },
    {
      alignItems: "stretch",
      expectedC1Y: 0,
      expectedC1Height: 30, // Explicit height overrides stretch
      expectedC2Y: 0,
      expectedC2Height: containerHeight, // Stretched
      idSuffix: "stretch",
    },
    // Test alignSelf overriding alignItems
    {
      alignItems: "flex-start",
      child2AlignSelf: "center",
      expectedC1Y: 0,
      expectedC1Height: 30,
      expectedC2Y: (containerHeight - 0) / 2, // Centered, height 0
      expectedC2Height: 0,
      idSuffix: "alignSelf-center",
    },
    {
      alignItems: "flex-start",
      child2AlignSelf: "stretch",
      expectedC1Y: 0,
      expectedC1Height: 30,
      expectedC2Y: 0,
      expectedC2Height: containerHeight, // Stretched via alignSelf
      idSuffix: "alignSelf-stretch",
    },
    {
      alignItems: "stretch", // Container is stretch
      child2AlignSelf: "flex-start", // Child override, should not stretch
      expectedC1Y: 0,
      expectedC1Height: 30, // c1 follows container's stretch (but has explicit height)
      expectedC2Y: 0, // flex-start y position
      expectedC2Height: 0, // Not stretched due to alignSelf, no explicit height
      idSuffix: "alignSelf-fs-from-stretch",
    },
  ]

  for (const tc of testCases) {
    it(`should correctly layout with alignItems: ${tc.alignItems}${tc.child2AlignSelf ? ` and child2 alignSelf: ${tc.child2AlignSelf}` : ""} (id: ${tc.idSuffix})`, () => {
      const root = new RootFlexBox(containerWidth, containerHeight, {
        alignItems: tc.alignItems,
        columnGap: 0,
        id: `root-${tc.idSuffix}`,
      })

      const c1EffectiveStyle = { ...child1Style, id: `c1-${tc.idSuffix}` }
      const c2EffectiveStyle = { ...child2Style, id: `c2-${tc.idSuffix}` }
      if (tc.child2AlignSelf) {
        c2EffectiveStyle.alignSelf = tc.child2AlignSelf
      }

      const child1 = root.addChild(c1EffectiveStyle)
      const child2 = root.addChild(c2EffectiveStyle)

      root.build()

      // Child 1 assertions
      expect(child1.size.width).toBe(childBasis)
      expect(child1.size.height).toBeCloseTo(tc.expectedC1Height)
      expect(child1.position.x).toBeCloseTo(0)
      expect(child1.position.y).toBeCloseTo(tc.expectedC1Y)

      // Child 2 assertions
      expect(child2.size.width).toBe(childBasis)
      expect(child2.size.height).toBeCloseTo(tc.expectedC2Height)
      expect(child2.position.x).toBeCloseTo(childBasis)
      expect(child2.position.y).toBeCloseTo(tc.expectedC2Y)

      expect(
        convertFlexBoxToSvg(root, {
          title: `AlignItems: ${tc.alignItems}${tc.child2AlignSelf ? `, C2 Self: ${tc.child2AlignSelf}` : ""}`,
        }),
      ).toMatchSvgSnapshot(import.meta.path, `align-items-${tc.idSuffix}`)
    })
  }
})
