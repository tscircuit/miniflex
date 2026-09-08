import { expect, test } from "bun:test"
import { RootFlexBox, type Direction } from "../lib/minimal-flexbox"

for (const direction of ["row", "column"] as Direction[]) {
  for (const previousSizing of ["explicit", "stretch"] as const) {
    test(`${direction}: removing ${previousSizing} sizing matches a fresh leaf`, () => {
      const cross = direction === "row" ? "height" : "width"
      const root = new RootFlexBox(100, 80, {
        direction,
        alignItems: previousSizing === "stretch" ? "stretch" : "center",
      })
      const child = root.addChild({
        flexBasis: 20,
        ...(previousSizing === "explicit" ? { [cross]: 30 } : {}),
      })
      root.build()
      expect(child.size[cross]).toBeGreaterThan(0)

      delete child.style[cross]
      root.alignItems = "center"
      root.build()

      const fresh = new RootFlexBox(100, 80, {
        direction,
        alignItems: "center",
      })
      const freshChild = fresh.addChild({ flexBasis: 20 })
      fresh.build()
      expect(child.size).toEqual(freshChild.size)
      expect(child.position).toEqual(freshChild.position)
    })
  }
}
