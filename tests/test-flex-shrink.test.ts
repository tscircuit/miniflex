import { expect, test } from "bun:test"
import { RootFlexBox } from "../lib/minimal-flexbox"

for (const direction of ["row", "column"] as const) {
  const cases = [
    {
      name: "unequal bases",
      bases: [100, 200],
      factors: [1, 1],
      length: 240,
      gap: 0,
      expected: [80, 160],
    },
    {
      name: "zero basis",
      bases: [0, 200],
      factors: [1, 1],
      length: 100,
      gap: 0,
      expected: [0, 100],
    },
    {
      name: "gap is reserved",
      bases: [100, 200],
      factors: [1, 1],
      length: 250,
      gap: 10,
      expected: [80, 160],
    },
    {
      name: "nonshrinking sibling",
      bases: [100, 200],
      factors: [0, 1],
      length: 240,
      gap: 0,
      expected: [100, 140],
    },
    {
      name: "redistribute after zero clamp",
      bases: [50, 100],
      factors: [10, 1],
      length: 60,
      gap: 0,
      expected: [0, 60],
    },
    {
      name: "fractional shrink",
      bases: [100, 200],
      factors: [0.2, 0.2],
      length: 240,
      gap: 0,
      expected: [92, 184],
    },
    {
      name: "no shrink",
      bases: [100, 200],
      factors: [0, 0],
      length: 240,
      gap: 0,
      expected: [100, 200],
    },
    {
      name: "unavoidable overflow",
      bases: [100, 50],
      factors: [0, 1],
      length: 60,
      gap: 0,
      expected: [100, 0],
    },
  ]
  for (const { name, bases, factors, length, gap, expected } of cases) {
    test(`${direction}: ${name}`, () => {
      const root = new RootFlexBox(length, length, {
        direction,
        columnGap: gap,
        rowGap: gap,
      })
      const children = bases.map((flexBasis, i) =>
        root.addChild({ flexBasis, flexShrink: factors[i] }),
      )
      root.build()
      const dimension = direction === "row" ? "width" : "height"
      children.forEach((child, i) =>
        expect(child.size[dimension]).toBeCloseTo(expected[i]!, 8),
      )
      // Rebuilding must not shrink the already-computed sizes a second time.
      root.build()
      children.forEach((child, i) =>
        expect(child.size[dimension]).toBeCloseTo(expected[i]!, 8),
      )
    })
  }
}
