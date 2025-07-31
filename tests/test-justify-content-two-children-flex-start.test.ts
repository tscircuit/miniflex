import { RootFlexBox, type Justify } from "../lib/minimal-flexbox"
import { it, expect } from "bun:test"
import { convertFlexBoxToSvg } from "./fixtures/convertFlexBoxToSvg"

const containerWidth = 300
const containerHeight = 50
const child1Basis = 50
const child2Basis = 100
const columnGap = 0 // Using 0 gap to simplify position assertions

const justify: Justify = "flex-start"
const expectedPositions = [
  { x: 0, y: 0 }, // child1
  { x: 50, y: 0 }, // child2 (starts after child1)
]

it(`should correctly layout two children with ${justify}`, () => {
  const root = new RootFlexBox(containerWidth, containerHeight, {
    justifyContent: justify,
    columnGap,
    id: `root-${justify}`,
  })
  const child1 = root.addChild({ flexBasis: child1Basis, id: `c1-${justify}` })
  const child2 = root.addChild({ flexBasis: child2Basis, id: `c2-${justify}` })

  root.build()

  expect(child1.size.width).toBe(child1Basis)
  expect(child1.position.x).toBeCloseTo(expectedPositions[0]!.x)
  expect(child1.position.y).toBeCloseTo(expectedPositions[0]!.y)

  expect(child2.size.width).toBe(child2Basis)
  expect(child2.position.x).toBeCloseTo(expectedPositions[1]!.x)
  expect(child2.position.y).toBeCloseTo(expectedPositions[1]!.y)

  expect(
    convertFlexBoxToSvg(root, { title: `Two Children, justify: ${justify}` }),
  ).toMatchSvgSnapshot(import.meta.path, `two-children-${justify}`)
})
