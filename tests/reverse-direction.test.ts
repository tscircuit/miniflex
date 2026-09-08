import { test } from "bun:test"
import { strict as assert } from "node:assert"
import { RootFlexBox } from "../lib/minimal-flexbox"

for (const direction of ["row", "column"] as const) {
  for (const justifyContent of ["flex-start", "flex-end", "center"] as const) {
    for (const reverse of [false, true]) {
      test(`${direction} ${justifyContent} reverse=${reverse}`, () => {
        const root = new RootFlexBox(100, 100, {
          direction: reverse ? `${direction}-reverse` : direction,
          justifyContent,
          columnGap: 10,
          rowGap: 10,
        })
        const first = root.addChild({
          id: "first",
          flexBasis: 20,
          flexShrink: 0,
        })
        const second = root.addChild({
          id: "second",
          flexBasis: 30,
          flexShrink: 0,
        })
        const leading =
          justifyContent === "flex-start"
            ? 0
            : justifyContent === "center"
              ? 20
              : 40
        const expected = reverse
          ? [80 - leading, 40 - leading]
          : [leading, leading + 30]
        const axis = direction === "row" ? "x" : "y"
        const positions = () => [first.position[axis], second.position[axis]]
        const layout = root.getLayout()
        assert.deepEqual(positions(), expected)
        assert.deepEqual(root.children, [first, second])
        assert.equal(layout.first?.position[axis], expected[0])
        assert.equal(layout.second?.position[axis], expected[1])
        root.build()
        assert.deepEqual(positions(), expected)
      })
    }
  }
}
