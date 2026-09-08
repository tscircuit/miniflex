import { test } from "bun:test"
import { strict as assert } from "node:assert"
import { RootFlexBox, FlexBox, FlexElement } from "../lib/minimal-flexbox"

test("addChild with no arguments returns a configurable leaf", () => {
  const root = new RootFlexBox(100, 40)
  const leaf: FlexElement = root.addChild()
  leaf.style.flexGrow = 1
  root.build()
  assert.equal(leaf instanceof FlexElement, true)
  assert.deepEqual(leaf.size, { width: 100, height: 40 })
})

test("explicit undefined and an empty style retain the same behavior", () => {
  const root = new RootFlexBox(100, 40)
  const first = root.addChild(undefined)
  const second = root.addChild({})
  assert.deepEqual(first.style, second.style)
})

test("the nested container overload retains its specific return type", () => {
  const root = new RootFlexBox(100, 40)
  const nested: FlexBox = root.addChild(new FlexBox(10, 10))
  const leaf: FlexElement = nested.addChild()
  assert.equal(root.children[0], nested)
  assert.equal(nested.children[0], leaf)
})
