import { test } from "bun:test"
import { strict as assert } from "node:assert"
import { RootFlexBox, FlexBox } from "../lib/minimal-flexbox"
import type { FlexBoxOptions } from "../lib/types"

const layout = (options: FlexBoxOptions) => {
  const root = new RootFlexBox(100, 60, options)
  root.addChild({ id: "first", flexBasis: 20 })
  root.addChild({ id: "second", flexBasis: 30 })
  return root.getLayout()
}

for (const key of [
  "direction",
  "columnGap",
  "rowGap",
  "alignItems",
  "justifyContent",
] as const) {
  test(`undefined ${key} has the same layout as an omitted option`, () => {
    assert.deepEqual(layout({ [key]: undefined }), layout({}))
  })
}

test("an undefined row gap preserves column layout", () => {
  assert.deepEqual(
    layout({ direction: "column", rowGap: undefined }),
    layout({ direction: "column" }),
  )
})

test("explicit zero gaps and nondefault alignment are retained", () => {
  const options: FlexBoxOptions = Object.freeze({
    direction: "column",
    rowGap: 0,
    columnGap: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    id: "",
  })
  const root = new RootFlexBox(100, 60, options)
  const child = root.addChild({ flexBasis: 20, width: 10 })
  root.build()
  assert.deepEqual(child.position, { x: 45, y: 40 })
  assert.equal(root.id, "")
})

test("nested containers also keep omitted-option defaults", () => {
  const root = new RootFlexBox(100, 60)
  const nested = root.addChild(new FlexBox(0, 0, { direction: undefined }), {
    flexBasis: 100,
  })
  const leaf = nested.addChild({ flexBasis: 20 })
  root.build()
  assert.deepEqual(leaf.size, { width: 20, height: 60 })
})
