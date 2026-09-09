import { describe, expect, test } from "bun:test"
import { getMinimumFlexContainer, type FlexBoxOptions, type Size } from "../lib"

describe("getMinimumFlexContainer", () => {
  test("defaults to a row with no gap", () => {
    expect(
      getMinimumFlexContainer([
        { width: 10, height: 5 },
        { width: 20, height: 7 },
      ]),
    ).toEqual({ width: 30, height: 7 })
  })

  test.each([
    ["row", { width: 37, height: 7 }],
    ["row-reverse", { width: 37, height: 7 }],
    ["column", { width: 20, height: 18 }],
    ["column-reverse", { width: 20, height: 18 }],
  ] as const)(
    "handles %s direction and its relevant gap",
    (direction, expected) => {
      const children: Array<Size> = [
        { width: 10, height: 5 },
        { width: 20, height: 7 },
      ]
      const options: FlexBoxOptions = {
        direction,
        columnGap: 7,
        rowGap: 6,
      }

      expect(getMinimumFlexContainer(children, options)).toEqual(expected)
    },
  )

  test("returns zero dimensions for an empty container", () => {
    expect(getMinimumFlexContainer([], { columnGap: 10, rowGap: 20 })).toEqual({
      width: 0,
      height: 0,
    })
  })

  test("does not add a gap for a single child", () => {
    expect(
      getMinimumFlexContainer([{ width: 4, height: 9 }], {
        direction: "column",
        rowGap: 12,
      }),
    ).toEqual({ width: 4, height: 9 })
  })

  test("preserves zero dimensions", () => {
    expect(
      getMinimumFlexContainer(
        [
          { width: 0, height: 0 },
          { width: 0, height: 5 },
        ],
        { direction: "row", columnGap: 0 },
      ),
    ).toEqual({ width: 0, height: 5 })
  })

  test("does not mutate its inputs", () => {
    const children: Array<Size> = [
      { width: 3, height: 4 },
      { width: 8, height: 2 },
    ]
    const options: FlexBoxOptions = { direction: "row-reverse", columnGap: 2 }
    const originalChildren = structuredClone(children)
    const originalOptions = structuredClone(options)

    getMinimumFlexContainer(children, options)

    expect(children).toEqual(originalChildren)
    expect(options).toEqual(originalOptions)
  })
})
