import { RootFlexBox, FlexBox } from "./minimal-flexbox" // Added FlexBox
import type {
  FlexStyle,
  Size,
  Position,
  Direction,
  Justify,
  Align,
  FlexBoxOptions,
} from "./types"

export interface FlexBoxItem extends FlexStyle {
  children?: FlexBoxItem[]
}

// Helper to extract FlexBoxOptions from a FlexBoxItem, with defaults.
// Assumes properties like 'direction' might exist on item dynamically.
function _getFlexBoxOptions(item: FlexBoxItem): FlexBoxOptions {
  const opts: FlexBoxOptions = { id: item.id }
  // Provide defaults from FlexBox class if properties are not on item
  opts.direction = (item as any).direction ?? "row"
  opts.columnGap = (item as any).columnGap ?? 0
  opts.rowGap = (item as any).rowGap ?? 0
  opts.justifyContent = (item as any).justifyContent ?? "flex-start"
  opts.alignItems = (item as any).alignItems ?? "stretch"
  return opts
}

// Helper function to recursively populate FlexBox instances from FlexBoxItem tree
function _populateFlexBoxRecursive(
  flexContainer: FlexBox, // The FlexBox instance to add children to
  items: FlexBoxItem[] | undefined, // The list of child items to add
) {
  if (!items) {
    return
  }

  for (const item of items) {
    // 'item' is a FlexBoxItem. It includes FlexStyle properties.
    // These properties (flexGrow, flexShrink, etc.) define how 'item' behaves as a child.
    // We can pass 'item' as Partial<FlexStyle> because FlexNode constructor handles defaults.

    if (item.children && item.children.length > 0) {
      // This item represents a nested FlexBox container
      const nestedBoxOptions = _getFlexBoxOptions(item) // Extract FlexBoxOptions for the new container

      // Use item.width/height from its style for the initial size of the nested FlexBox.
      // These are treated as explicit dimensions for the item itself.
      const initialWidth = item.width ?? 0
      const initialHeight = item.height ?? 0

      const nestedFlexBox = new FlexBox(
        initialWidth,
        initialHeight,
        nestedBoxOptions,
      )

      // Add the new FlexBox (nestedFlexBox) as a child to the current flexContainer.
      // The 'item' itself provides the FlexStyle for this nestedFlexBox AS AN ITEM.
      flexContainer.addChild(nestedFlexBox, item)

      _populateFlexBoxRecursive(nestedFlexBox, item.children) // Recurse
    } else {
      // This item is a leaf FlexElement
      // 'item' provides the FlexStyle for this element.
      flexContainer.addChild(item)
    }
  }
}

export const flexBoxLayout = (
  parent: FlexBoxItem, // This 'parent' FlexBoxItem describes the root flex container
): Record<string, { position: Position; size: Size }> => {
  // Use parent.width/height for RootFlexBox dimensions, defaulting to 0 if undefined.
  const rootWidth = parent.width ?? 0
  const rootHeight = parent.height ?? 0

  // Extract FlexBoxOptions for the root container from the 'parent' item.
  const rootOpts = _getFlexBoxOptions(parent)

  const root = new RootFlexBox(rootWidth, rootHeight, rootOpts)

  // Recursively populate the 'root' FlexBox based on 'parent.children'.
  _populateFlexBoxRecursive(root, parent.children)

  // Compute the layout and return the map.
  return root.getLayout()
}
