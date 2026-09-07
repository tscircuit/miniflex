import { describe, expect, it } from "bun:test"
import { FlexBox, RootFlexBox, type FlexStyle } from "../lib"

for (const nested of [false, true]) {
  describe(`undefined optional styles on ${nested ? "containers" : "leaves"}`, () => {
    function add(root: RootFlexBox, style: Partial<FlexStyle>) {
      return nested
        ? root.addChild(new FlexBox(0, 0), style)
        : root.addChild(style)
    }

    it("defaults an undefined basis before distributing free space", () => {
      const root = new RootFlexBox(100, 80)
      const first = add(root, { flexBasis: undefined, flexGrow: 1 })
      const second = root.addChild({ flexBasis: 20, flexGrow: 1 })
      root.build()
      expect(first.size).toEqual({ width: 40, height: 80 })
      expect(second.size.width).toBe(60)
      expect(second.position.x).toBe(40)
    })

    it("does not let an undefined grow factor prevent sibling growth", () => {
      const root = new RootFlexBox(100, 80)
      const first = add(root, { flexBasis: 20, flexGrow: undefined })
      const second = root.addChild({ flexBasis: 20, flexGrow: 1 })
      root.build()
      expect(first.size.width).toBe(20)
      expect(second.size.width).toBe(80)
    })

    it("defaults an undefined shrink factor when space is insufficient", () => {
      const root = new RootFlexBox(100, 80)
      const first = add(root, { flexBasis: 80, flexShrink: undefined })
      const second = root.addChild({ flexBasis: 80 })
      root.build()
      expect(first.size.width).toBe(50)
      expect(second.size.width).toBe(50)
    })

    it("inherits centered alignment when alignSelf is undefined", () => {
      const root = new RootFlexBox(100, 80, { alignItems: "center" })
      const child = add(root, {
        flexBasis: 20,
        height: 30,
        alignSelf: undefined,
      })
      root.build()
      expect(child.position.y).toBe(25)
      expect(child.size.height).toBe(30)
    })

    it("inherits stretch with forwarded undefined options", () => {
      const root = new RootFlexBox(100, 80)
      const child = add(root, {
        flexGrow: undefined,
        flexShrink: undefined,
        flexBasis: undefined,
        alignSelf: undefined,
        width: undefined,
        height: undefined,
      })
      root.build()
      expect(child.position).toEqual({ x: 0, y: 0 })
      expect(child.size).toEqual({ width: 0, height: 80 })
    })

    it("preserves explicit zero values and alignment overrides", () => {
      const root = new RootFlexBox(10, 80)
      const child = add(root, {
        flexBasis: 20,
        flexGrow: 0,
        flexShrink: 0,
        height: 0,
        alignSelf: "flex-end",
      })
      root.build()
      expect(child.position).toEqual({ x: 0, y: 80 })
      expect(child.size).toEqual({ width: 20, height: 0 })
    })
  })
}
