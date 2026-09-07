import { describe, expect, it } from "bun:test"
import { RootFlexBox } from "../lib"

for (const direction of ["row", "column"] as const) {
  describe(`fractional flex growth in a ${direction}`, () => {
    const size = direction === "row" ? "width" : "height"
    const position = direction === "row" ? "x" : "y"

    it("leaves unrequested free space when grow factors sum to less than one", () => {
      const root = new RootFlexBox(100, 100, { direction })
      const first = root.addChild({ flexBasis: 10, flexGrow: 0.25 })
      const second = root.addChild({ flexBasis: 20, flexGrow: 0.25 })
      root.build()
      expect(first.size[size]).toBe(27.5)
      expect(second.size[size]).toBe(37.5)
      expect(second.position[position]).toBe(27.5)
    })

    it("passes the unused space to justification after accounting for gaps", () => {
      const root = new RootFlexBox(100, 100, {
        direction,
        columnGap: 10,
        rowGap: 10,
        justifyContent: "center",
      })
      const first = root.addChild({ flexBasis: 10, flexGrow: 0.25 })
      const second = root.addChild({ flexBasis: 20, flexGrow: 0.25 })
      root.build()
      expect(first.size[size]).toBe(25)
      expect(second.size[size]).toBe(35)
      expect(first.position[position]).toBe(15)
      expect(second.position[position]).toBe(50)
    })

    it("uses all space at a total factor of one and preserves relative growth above one", () => {
      for (const factor of [0.5, 1, 2]) {
        const root = new RootFlexBox(100, 100, { direction })
        const first = root.addChild({ flexBasis: 10, flexGrow: factor })
        const second = root.addChild({ flexBasis: 20, flexGrow: factor })
        root.build()
        expect(first.size[size]).toBe(45)
        expect(second.size[size]).toBe(55)
      }
    })

    it("keeps zero-grow items fixed beside a fractional grower", () => {
      const root = new RootFlexBox(100, 100, { direction })
      const first = root.addChild({ flexBasis: 10, flexGrow: 0 })
      const second = root.addChild({ flexBasis: 20, flexGrow: 0.1 })
      root.build()
      expect(first.size[size]).toBe(10)
      expect(second.size[size]).toBe(27)

      root.size[size] = 200
      root.build()
      expect(first.size[size]).toBe(10)
      expect(second.size[size]).toBe(37)
    })
  })
}
