import { expect, test } from "bun:test"
import { FlexBox, RootFlexBox } from "../lib/minimal-flexbox"
import type { Direction } from "../lib/types"

const directions: Direction[] = [
  "row",
  "column",
  "row-reverse",
  "column-reverse",
]

const cases = [
  {
    name: "equal shrink factors preserve the ratio of unequal bases",
    available: 150,
    gap: 0,
    items: [
      { basis: 100, shrink: 1, expected: 50 },
      { basis: 200, shrink: 1, expected: 100 },
    ],
  },
  {
    name: "shrink factors scale each item's basis",
    available: 150,
    gap: 0,
    items: [
      { basis: 100, shrink: 2, expected: 25 },
      { basis: 200, shrink: 1, expected: 125 },
    ],
  },
  {
    name: "a zero basis consumes no shrink space",
    available: 100,
    gap: 0,
    items: [
      { basis: 0, shrink: 1, expected: 0 },
      { basis: 200, shrink: 1, expected: 100 },
    ],
  },
  {
    name: "non-shrinking items retain their basis",
    available: 150,
    gap: 0,
    items: [
      { basis: 100, shrink: 0, expected: 100 },
      { basis: 200, shrink: 1, expected: 50 },
    ],
  },
  {
    name: "space remaining after a zero-size clamp is redistributed",
    available: 150,
    gap: 0,
    items: [
      { basis: 100, shrink: 1000, expected: 0 },
      { basis: 200, shrink: 1, expected: 150 },
    ],
  },
  {
    name: "fractional shrink factors can leave unresolved overflow",
    available: 150,
    gap: 0,
    items: [
      { basis: 100, shrink: 0.25, expected: 75 },
      { basis: 200, shrink: 0.25, expected: 150 },
    ],
  },
  {
    name: "the gap is excluded from space available to children",
    available: 160,
    gap: 10,
    items: [
      { basis: 100, shrink: 1, expected: 50 },
      { basis: 200, shrink: 1, expected: 100 },
    ],
  },
  {
    name: "an oversized gap leaves zero-sized children",
    available: 5,
    gap: 10,
    items: [
      { basis: 100, shrink: 1, expected: 0 },
      { basis: 200, shrink: 1, expected: 0 },
    ],
  },
  {
    name: "inflexible children may overflow without changing size",
    available: 150,
    gap: 0,
    items: [
      { basis: 100, shrink: 0, expected: 100 },
      { basis: 200, shrink: 0, expected: 200 },
    ],
  },
]

for (const direction of directions) {
  for (const { name, available, gap, items } of cases) {
    test(`${direction}: ${name}`, () => {
      const root = new RootFlexBox(available, available, {
        direction,
        columnGap: gap,
        rowGap: gap,
      })
      const children = items.map(({ basis, shrink, expected }) => ({
        node: root.addChild({ flexBasis: basis, flexShrink: shrink }),
        expected,
      }))
      root.build()
      const axis = direction.startsWith("row") ? "width" : "height"
      for (const { node, expected } of children) {
        expect(node.size[axis]).toBeCloseTo(expected, 8)
      }
    })
  }
}

test("nested containers lay out their children using the resolved size", () => {
  const root = new RootFlexBox(150, 40)
  const nested = new FlexBox(100, 40)
  const leaf = nested.addChild({ flexGrow: 1 })
  root.addChild(nested, { flexBasis: 100 })
  root.addChild({ flexBasis: 200 })
  root.build()
  expect(nested.size.width).toBe(50)
  expect(leaf.size.width).toBe(50)
  root.build()
  expect(leaf.size.width).toBe(50)
})
