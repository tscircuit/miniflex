# @tscircuit/miniflex

A tiny TypeScript/JavaScript implementation of a minimal, single-file flexbox engine. It supports core flexbox features like direction, gap, justification, alignment, and nesting.

## Features

- **Flex Direction**: `row`, `row-reverse`, `column`, `column-reverse`.
- **Content Justification**: `flex-start`, `flex-end`, `center`, `space-between`, `space-around`, `space-evenly`.
- **Item Alignment**: `flex-start`, `flex-end`, `center`, `stretch` for container (`alignItems`) and individual items (`alignSelf`).
- **Gaps**: `columnGap` and `rowGap` between items.
- **Flex Properties**: `flexGrow`, `flexShrink`, `flexBasis`.
- **Explicit Sizing**: Set `width` and `height` on children.
- **Nesting**: Flex containers can be nested within each other.
- **Simple API**: Easy to create a root container, add children (elements or nested containers), and compute the layout.
- **Layout Output**: Retrieve computed positions and sizes for all elements.

## Installation

```bash
bun add @tscircuit/miniflex
```

## Usage

Here's a basic example of how to use `miniflex`:

```typescript
import { RootFlexBox, FlexBox } from "@tscircuit/miniflex"

// Create a root flex container
const root = new RootFlexBox(800, 200, {
  direction: "row",
  columnGap: 10,
  justifyContent: "space-between",
  alignItems: "center",
  id: "rootContainer",
})

// Add child elements
const child1 = root.addChild({ flexGrow: 1, id: "childOne", height: 50 }) // Explicit height
const child2 = root.addChild({
  flexGrow: 2,
  flexBasis: 100,
  alignSelf: "flex-end",
  id: "childTwo",
})

// Create and add a nested flex container
const nestedBox = new FlexBox(0, 0, {
  // Initial size 0,0; will be determined by parent
  direction: "column",
  rowGap: 5,
  alignItems: "stretch",
  id: "nestedContainer",
})
nestedBox.addChild({ flexBasis: 30, id: "nestedChildA" }) // Will stretch to nestedBox's width
nestedBox.addChild({ flexBasis: 40, id: "nestedChildB" })
root.addChild(nestedBox, { flexGrow: 1, id: "nestedBoxWrapper" }) // Add nestedBox to root

// Compute the layout
root.build()

// Access layout information
console.log("Child 1:", child1.position, child1.size)
console.log("Child 2:", child2.position, child2.size)
console.log(
  "Nested Box (as child of root):",
  nestedBox.position,
  nestedBox.size
)
console.log(
  "First child of Nested Box:",
  nestedBox.children[0].position,
  nestedBox.children[0].size
)

// Get the full layout map
const layout = root.getLayout()
console.log("\nFull Layout Map:")
for (const id in layout) {
  console.log(
    `${id}: P(${layout[id].position.x}, ${layout[id].position.y}), S(${layout[id].size.width}, ${layout[id].size.height})`
  )
}
```

## API Overview

### `RootFlexBox(width: number, height: number, options?: FlexBoxOptions)`

Creates the main flex container.

- `width`, `height`: Dimensions of the root container.
- `options`: Optional `FlexBoxOptions` object:
  - `id?: string`: An identifier for the box.
  - `direction?: Direction`: "row" (default), "row-reverse", "column", "column-reverse".
  - `columnGap?: number`: Gap between columns (default: 0).
  - `rowGap?: number`: Gap between rows (default: 0).
  - `justifyContent?: Justify`: "flex-start" (default), "flex-end", "center", "space-between", "space-around", "space-evenly".
  - `alignItems?: Align`: "stretch" (default), "flex-start", "flex-end", "center".

### `FlexBox(width: number, height: number, options?: FlexBoxOptions)`

Creates a nestable flex container. Typically, `width` and `height` are initially 0, as they will be determined by the parent flex layout.

- Parameters are the same as `RootFlexBox`.

### `flexBox.addChild(style: Partial<FlexStyle>): FlexElement`

Adds a leaf element (not a container) to the flexbox.

- `style`: Optional `FlexStyle` object for the child:
  - `id?: string`: An identifier for the element.
  - `flexGrow?: number`: (default: 0)
  - `flexShrink?: number`: (default: 1)
  - `flexBasis?: number`: (default: 0)
  - `alignSelf?: Align | "auto"`: Overrides container's `alignItems`. "auto" (default) inherits.
  - `width?: number`: Explicit width.
  - `height?: number`: Explicit height.

### `flexBox.addChild(box: FlexBox, style?: Partial<FlexStyle>): FlexBox`

Adds a nested `FlexBox` container as a child.

- `box`: An instance of `FlexBox`.
- `style`: Optional `FlexStyle` object to apply to the `box` itself within its parent's layout (e.g., `flexGrow` for the nested container).

### `flexBox.build()`

Computes the layout for the `FlexBox` and all its children. This must be called on the `RootFlexBox` after all children are added.

### `flexNode.position: Position`

After `build()`, contains the `{ x, y }` coordinates of the node.

### `flexNode.size: Size`

After `build()`, contains the `{ width, height }` of the node.

### `rootFlexBox.getLayout(): Record<string, { position: Position; size: Size }>`

After `build()`, returns a map where keys are item IDs (or auto-generated IDs) and values are their computed `position` and `size`.

### `flexBoxLayout(parent: FlexBoxItem): Record<string, { position: Position; size: Size }>`

A utility function that takes a tree of `FlexBoxItem` objects, constructs the corresponding `RootFlexBox` and nested `FlexBox` instances, computes the layout, and returns the layout map. This is useful for scenarios where the layout structure is defined declaratively (e.g., from a configuration file or a different data structure).

- `parent`: The root `FlexBoxItem` object describing the entire layout.

#### `FlexBoxItem` Interface

The `flexBoxLayout` function uses objects conforming to the `FlexBoxItem` interface. This interface extends `FlexStyle` and adds an optional `children` array. Additionally, properties typically found in `FlexBoxOptions` (like `direction`, `columnGap`, `rowGap`, `justifyContent`, `alignItems`) can be included directly on a `FlexBoxItem` if it represents a flex container (i.e., it has `children`).

```typescript
interface FlexBoxItem extends FlexStyle {
  children?: FlexBoxItem[];
  // Plus, optionally, FlexBoxOptions if it's a container:
  // direction?: Direction;
  // columnGap?: number;
  // rowGap?: number;
  // justifyContent?: Justify;
  // alignItems?: Align;
}
```

#### Example using `flexBoxLayout`:

```typescript
import { flexBoxLayout, type FlexBoxItem } from "@tscircuit/miniflex";

const layoutDefinition: FlexBoxItem = {
  id: "root",
  width: 300,
  height: 200,
  direction: "column", // FlexBoxOption for the root container
  alignItems: "stretch",
  rowGap: 10,
  children: [
    {
      id: "child1",
      flexGrow: 1, // FlexStyle for child1
      // This child is also a container
      direction: "row", // FlexBoxOption for child1 container
      columnGap: 5,
      alignItems: "center",
      children: [
        { id: "grandchildA", flexBasis: 50, height: 30 }, // FlexStyle for grandchildA
        { id: "grandchildB", flexGrow: 1, height: 40 },   // FlexStyle for grandchildB
      ],
    },
    {
      id: "child2",
      flexBasis: 50, // FlexStyle for child2 (leaf item)
    },
  ],
};

const layoutMap = flexBoxLayout(layoutDefinition);

console.log("\nLayout Map from flexBoxLayout:");
for (const id in layoutMap) {
  console.log(
    `${id}: P(${layoutMap[id].position.x}, ${layoutMap[id].position.y}), S(${layoutMap[id].size.width}, ${layoutMap[id].size.height})`
  );
}
```

## Building the Project

To build the TypeScript source to JavaScript:

```bash
bun run build
```

This will output files to the `dist` directory.

## Running Tests

The project uses `bun:test` for testing. Tests are located in the `tests` directory.
To run all tests:

```bash
bun test
```

Snapshot tests are used for visual layouts, generating SVG files for comparison.
To update snapshots:

```bash
BUN_UPDATE_SNAPSHOTS=1 bun test
```
