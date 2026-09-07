import { expect, test } from "bun:test"
import { FlexBox, RootFlexBox } from "../lib/minimal-flexbox"

for (const explicitFirst of [false, true]) {
  test(`automatic IDs avoid explicit IDs (${explicitFirst ? "before" : "after"})`, () => {
    const root = new RootFlexBox(100, 40)
    const styles = [{ id: "_$$0", flexBasis: 20 }, { flexBasis: 30 }]
    for (const style of explicitFirst ? styles : styles.toReversed()) {
      root.addChild(style)
    }
    const layout = root.getLayout()
    expect(Object.keys(layout)).toHaveLength(2)
    expect(layout["_$$0"]?.size.width).toBe(20)
    expect(layout["_$$1"]?.size.width).toBe(30)
  })
}

test("automatic IDs reserve explicit keys in later nested branches", () => {
  const root = new RootFlexBox(100, 40)
  root.addChild({ flexBasis: 10 })
  const box = root.addChild(new FlexBox(0, 0, { id: "box" }), {
    flexBasis: 40,
  })
  box.addChild({ id: "_$$0", flexBasis: 20 })
  box.addChild({ flexBasis: 10 })
  root.addChild({ id: "_$$1", flexBasis: 20 })
  const layout = root.getLayout()
  expect(Object.keys(layout)).toEqual(["_$$2", "box", "_$$0", "_$$3", "_$$1"])
  expect(layout["_$$0"]?.size.width).toBe(20)
  expect(layout["_$$1"]?.size.width).toBe(20)
})

for (const id of ["__proto__", "constructor", "toString", ""]) {
  test(`exports special ID ${JSON.stringify(id)} as an ordinary own property`, () => {
    const root = new RootFlexBox(100, 40)
    root.addChild({ id, flexBasis: 20 })
    const layout = root.getLayout()
    expect(Object.keys(layout)).toEqual([id])
    expect(Object.hasOwn(layout, id)).toBe(true)
    expect(Object.getPrototypeOf(layout)).toBe(Object.prototype)
    expect(JSON.parse(JSON.stringify(layout))[id].size.width).toBe(20)
  })
}

test("ordinary generated IDs remain deterministic across repeated layouts", () => {
  const root = new RootFlexBox(100, 40)
  root.addChild({ flexBasis: 20 })
  root.addChild({ flexBasis: 30 })
  expect(Object.keys(root.getLayout())).toEqual(["_$$0", "_$$1"])
  expect(Object.keys(root.getLayout())).toEqual(["_$$0", "_$$1"])
})
