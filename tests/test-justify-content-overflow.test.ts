import { expect, test } from "bun:test"
import { FlexBox, RootFlexBox } from "../lib/minimal-flexbox"

const distributed = ["space-between", "space-around", "space-evenly"] as const

for (const direction of ["row", "column"] as const) {
  const main = direction === "row" ? "width" : "height"
  const axis = direction === "row" ? "x" : "y"

  for (const justifyContent of distributed) {
    for (const { name, bases, gap, positions } of [
      { name: "oversized items", bases: [80, 60], gap: 0, positions: [0, 80] },
      { name: "items and gap", bases: [80, 60], gap: 10, positions: [0, 90] },
      { name: "gap alone", bases: [40, 50], gap: 20, positions: [0, 60] },
      { name: "single item", bases: [140], gap: 10, positions: [0] },
    ]) {
      test(`${direction} ${justifyContent} preserves spacing when ${name} overflow`, () => {
        const root = new RootFlexBox(100, 100, {
          direction,
          justifyContent,
          columnGap: gap,
          rowGap: gap,
        })
        const children = bases.map((flexBasis) =>
          root.addChild({ flexBasis, flexShrink: 0 }),
        )
        root.build()

        // Distributed alignment falls back to start on overflow, preserving
        // the configured gap rather than subtracting space between items.
        expect(children.map((child) => child.size[main])).toEqual(bases)
        expect(children.map((child) => child.position[axis])).toEqual(positions)
      })
    }

    test(`${direction} ${justifyContent} preserves an overflowing gap after shrinking`, () => {
      const root = new RootFlexBox(20, 20, {
        direction,
        justifyContent,
        columnGap: 30,
        rowGap: 30,
      })
      const children = [
        root.addChild({ flexBasis: 10 }),
        root.addChild({ flexBasis: 10 }),
      ]
      root.build()

      expect(children.map((child) => child.size[main])).toEqual([0, 0])
      expect(children.map((child) => child.position[axis])).toEqual([0, 30])
    })
  }

  for (const { justifyContent, positions } of [
    { justifyContent: "flex-start", positions: [0, 80] },
    { justifyContent: "center", positions: [-20, 60] },
    { justifyContent: "flex-end", positions: [-40, 40] },
  ] as const) {
    test(`${direction} ${justifyContent} retains its explicit overflow alignment`, () => {
      const root = new RootFlexBox(100, 100, { direction, justifyContent })
      const first = root.addChild({ flexBasis: 80, flexShrink: 0 })
      const second = root.addChild({ flexBasis: 60, flexShrink: 0 })
      root.build()

      expect([first.position[axis], second.position[axis]]).toEqual([
        ...positions,
      ])
    })
  }

  test(`${direction} nested space-between updates when resized into and out of overflow`, () => {
    const root = new RootFlexBox(200, 200, { direction })
    const nested = root.addChild(
      new FlexBox(0, 0, {
        direction,
        justifyContent: "space-between",
        columnGap: 10,
        rowGap: 10,
      }),
      { flexGrow: 1 },
    )
    const first = nested.addChild({ flexBasis: 80, flexShrink: 0 })
    const second = nested.addChild({ flexBasis: 60, flexShrink: 0 })

    for (const [size, positions] of [
      [200, [0, 140]],
      [100, [0, 90]],
      [150, [0, 90]],
      [200, [0, 140]],
    ] as const) {
      root.size[main] = size
      root.build()
      expect(nested.size[main]).toBe(size)
      expect([first.size[main], second.size[main]]).toEqual([80, 60])
      expect([first.position[axis], second.position[axis]]).toEqual([
        ...positions,
      ])
    }
  })
}
