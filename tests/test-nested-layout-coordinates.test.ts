import { expect, test } from "bun:test"
import { FlexBox, RootFlexBox } from "../lib/minimal-flexbox"
import { convertFlexBoxToSvg } from "./fixtures/convertFlexBoxToSvg"

test("flattened layout includes every ancestor offset without changing local positions", () => {
  const root = new RootFlexBox(200, 100, {
    columnGap: 10,
    alignItems: "center",
  })
  root.addChild({ id: "spacer", flexBasis: 40, height: 10 })
  const panel = root.addChild(
    new FlexBox(0, 0, {
      id: "panel",
      direction: "column",
      rowGap: 5,
      alignItems: "center",
    }),
    { flexBasis: 80, height: 40 },
  )
  const heading = panel.addChild({
    id: "heading",
    flexBasis: 10,
    width: 30,
  })
  const content = panel.addChild(
    new FlexBox(0, 0, { id: "content", justifyContent: "flex-end" }),
    { flexBasis: 15, width: 20 },
  )
  const icon = content.addChild({ id: "icon", flexBasis: 5 })

  const layout = root.getLayout()
  expect(layout.panel?.position).toEqual({ x: 50, y: 30 })
  expect(layout.heading?.position).toEqual({ x: 75, y: 30 })
  expect(layout.content?.position).toEqual({ x: 80, y: 45 })
  expect(layout.icon?.position).toEqual({ x: 95, y: 45 })
  expect(heading.position).toEqual({ x: 25, y: 0 })
  expect(content.position).toEqual({ x: 30, y: 15 })
  expect(icon.position).toEqual({ x: 15, y: 0 })
  expect(root.getLayout()).toEqual(layout)
  expect(convertFlexBoxToSvg(root)).toMatchSvgSnapshot(
    import.meta.path,
    "nested-layout-coordinates",
  )
})
