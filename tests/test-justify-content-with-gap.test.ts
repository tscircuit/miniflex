import { expect, test } from "bun:test"
import { RootFlexBox } from "../lib/minimal-flexbox"

for (const direction of ["row", "column"] as const) {
  const mainPosition = direction === "row" ? "x" : "y"
  const mainSize = direction === "row" ? "width" : "height"

  for (const justifyContent of ["space-around", "space-evenly"] as const) {
    const createRoot = () =>
      new RootFlexBox(300, 300, {
        direction,
        justifyContent,
        columnGap: 30,
        rowGap: 30,
      })

    test(`${direction} ${justifyContent} adds the gap only between children`, () => {
      const root = createRoot()
      const first = root.addChild({ flexBasis: 50 })
      const second = root.addChild({ flexBasis: 100 })
      root.build()

      // 120px remains after the two items and their 30px gap.
      const positions: [number, number] =
        justifyContent === "space-around" ? [30, 170] : [40, 160]
      expect(first.position[mainPosition]).toBe(positions[0])
      expect(second.position[mainPosition]).toBe(positions[1])
      expect(first.size[mainSize]).toBe(50)
      expect(second.size[mainSize]).toBe(100)
      expect(first.position[mainPosition]).toBe(
        300 - second.position[mainPosition] - second.size[mainSize],
      )
    })

    test(`${direction} ${justifyContent} stays inside the container after flex growth`, () => {
      const root = createRoot()
      const first = root.addChild({ flexGrow: 1 })
      const second = root.addChild({ flexGrow: 1 })
      root.build()

      expect(first.size[mainSize]).toBe(135)
      expect(second.size[mainSize]).toBe(135)
      expect(first.position[mainPosition]).toBe(0)
      expect(second.position[mainPosition]).toBe(165)
      expect(second.position[mainPosition] + second.size[mainSize]).toBe(300)
    })

    test(`${direction} ${justifyContent} centers a single child regardless of gap`, () => {
      const root = createRoot()
      const child = root.addChild({ flexBasis: 50 })
      root.build()

      expect(child.position[mainPosition]).toBe(125)
      expect(child.size[mainSize]).toBe(50)
    })
  }
}
