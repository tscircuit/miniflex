import { expect, test } from "bun:test"
import { FlexBox, RootFlexBox } from "../lib/minimal-flexbox"

test("nested containers use the ID supplied through addChild", () => {
  const root = new RootFlexBox(100, 40)
  const nested = new FlexBox(0, 0)
  nested.addChild({ id: "grandchild", flexBasis: 10 })
  root.addChild(nested, { id: "nested", flexBasis: 40 })
  const layout = root.getLayout()
  expect(nested.id).toBe("nested")
  expect(Object.keys(layout)).toEqual(["nested", "grandchild"])
  expect(layout.nested?.size.width).toBe(40)
})

test("explicit nested identity overrides constructor identity like leaf style", () => {
  const root = new RootFlexBox(100, 40)
  const nested = new FlexBox(0, 0, { id: "old" })
  const metadata = { componentId: "board" }
  root.addChild(nested, { id: "new", metadata, flexBasis: 40 })
  const leaf = root.addChild({ id: "leaf", metadata, flexBasis: 20 })
  expect(nested.id).toBe("new")
  expect(nested.metadata).toBe(leaf.metadata)
  expect(Object.keys(root.getLayout())).toEqual(["new", "leaf"])
})

test("omitted identity fields preserve an existing nested identity", () => {
  const root = new RootFlexBox(100, 40)
  const nested = new FlexBox(0, 0, { id: "existing" })
  const metadata = { existing: true }
  nested.metadata = metadata
  root.addChild(nested, { flexBasis: 40 })
  expect(nested.id).toBe("existing")
  expect(nested.metadata).toBe(metadata)
  expect(root.getLayout().existing?.size.width).toBe(40)
})

test("undefined identity fields preserve existing values", () => {
  const root = new RootFlexBox(100, 40)
  const nested = new FlexBox(0, 0, { id: "existing" })
  nested.metadata = "existing metadata"
  root.addChild(nested, { id: undefined, metadata: undefined, flexBasis: 40 })
  expect(nested.id).toBe("existing")
  expect(nested.metadata).toBe("existing metadata")
})

test("empty IDs and null metadata are explicit values", () => {
  const root = new RootFlexBox(100, 40)
  const nested = new FlexBox(0, 0, { id: "old" })
  nested.metadata = "old"
  root.addChild(nested, { id: "", metadata: null, flexBasis: 40 })
  expect(nested.id).toBe("")
  expect(nested.metadata).toBeNull()
  expect(root.getLayout()[""]?.size.width).toBe(40)
})

test("attaching a container without a style preserves identity", () => {
  const root = new RootFlexBox(100, 40)
  const nested = new FlexBox(0, 0, { id: "existing" })
  nested.metadata = "metadata"
  expect(root.addChild(nested)).toBe(nested)
  expect(nested.id).toBe("existing")
  expect(nested.metadata).toBe("metadata")
})
