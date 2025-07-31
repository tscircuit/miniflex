// minimal-flexbox.ts – single‑file flexbox engine with direction, gap, nesting & alignment
// -------------------------------------------------------------
// Public API summary
//   • new RootFlexBox(width, height, options?)
//       options = { direction, columnGap, rowGap, justifyContent, alignItems }
//   • root.addChild(style?)                 // add leaf element
//   • root.addChild(childBox, style?)       // nest another flex container
//   • root.build()                          // compute the layout
//   • Every element (leaf or container) exposes `.position` & `.size`
// -------------------------------------------------------------

import type {
  FlexStyle,
  Size,
  Position,
  Direction,
  Justify,
  Align,
  FlexBoxOptions,
} from "./types"

const defaultStyle: FlexStyle = {
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 0,
  alignSelf: "auto",
  width: undefined,
  height: undefined,
}

// --- Core node ----------------------------------------------
abstract class FlexNode {
  id?: string
  metadata?: unknown
  /** Computed layout values */
  public readonly size: Size = { width: 0, height: 0 }
  public readonly position: Position = { x: 0, y: 0 }
  /** Incoming flex style (grow / shrink / basis / alignSelf) */
  public style: FlexStyle

  constructor(style: Partial<FlexStyle> = {}) {
    this.style = { ...defaultStyle, ...style }
    this.id = style.id
    this.metadata = style.metadata
  }

  /** Recursively lay out the subtree. */
  abstract build(): void
}

// --- Leaf element -------------------------------------------
export class FlexElement extends FlexNode {
  build(): void {
    /* nothing to recurse into */
  }
}

export class FlexBox extends FlexNode {
  public readonly children: FlexNode[] = []

  // Container‑level layout options (with sensible defaults)
  public direction: Direction = "row"
  public columnGap = 0
  public rowGap = 0
  public justifyContent: Justify = "flex-start"
  public alignItems: Align = "stretch"

  constructor(width: number, height: number, opts: FlexBoxOptions = {}) {
    super({})
    // The container’s own box size (root sets this explicitly; nested boxes
    // receive their size from the parent during layout).
    this.size.width = width
    this.size.height = height
    this.id = opts.id
    Object.assign(this, opts)
  }

  // --------------- Building the tree -----------------------
  /**
   * addChild(style?) → FlexElement        (leaf)
   * addChild(childBox, style?) → FlexBox  (nest another container)
   */
  addChild(style: Partial<FlexStyle>): FlexElement
  addChild(box: FlexBox, style?: Partial<FlexStyle>): FlexBox
  addChild(arg1: any, arg2?: any): any {
    if (arg1 instanceof FlexBox) {
      const box = arg1 as FlexBox
      if (arg2) box.style = { ...defaultStyle, ...arg2 }
      this.children.push(box)
      return box
    }
    const elem = new FlexElement(arg1 as Partial<FlexStyle>)
    this.children.push(elem)
    return elem
  }

  // --------------- Layout algorithm ------------------------
  build(): void {
    // 1. Identify axes & gaps
    const horizontal = this.direction.startsWith("row")
    const mainProp: keyof Size = horizontal ? "width" : "height"
    const crossProp: keyof Size = horizontal ? "height" : "width"
    const mainGap = horizontal ? this.columnGap : this.rowGap
    const crossGap = horizontal ? this.rowGap : this.columnGap // may be unused (single line)

    // 2. Gather flex statistics
    const gapTotal = mainGap * Math.max(0, this.children.length - 1)
    const containerMain = this.size[mainProp]
    const containerCross = this.size[crossProp]

    let totalBasis = 0
    let totalGrow = 0
    let totalShrink = 0

    for (const child of this.children) {
      totalBasis += child.style.flexBasis
      totalGrow += child.style.flexGrow
      totalShrink += child.style.flexShrink
    }

    const freeSpace = containerMain - totalBasis - gapTotal

    // 3. Resolve main‑axis sizes -------------------------------------------------
    for (const child of this.children) {
      let main = child.style.flexBasis

      if (freeSpace > 0 && totalGrow > 0) {
        main += (freeSpace * child.style.flexGrow) / totalGrow
      } else if (freeSpace < 0 && totalShrink > 0) {
        main += (freeSpace * child.style.flexShrink) / totalShrink
        if (main < 0) main = 0
      }

      child.size[mainProp] = main

      // Cross‑axis size (alignItems / alignSelf)
      const alignSelf =
        child.style.alignSelf !== "auto"
          ? (child.style.alignSelf as Align)
          : this.alignItems

      const explicitCrossSize = horizontal
        ? child.style.height
        : child.style.width

      if (explicitCrossSize !== undefined) {
        child.size[crossProp] = explicitCrossSize
      } else if (alignSelf === "stretch") {
        child.size[crossProp] = containerCross
      } else {
        // Item is not stretched and has no explicit cross size.
        // Its cross size is not changed by alignment; it remains its current value
        // (e.g., 0 for a FlexElement, or the defined size for a nested FlexBox).
      }
    }

    // 4. Justify content (main‑axis positioning) -------------------------------
    const occupied =
      this.children.reduce((sum, c) => sum + c.size[mainProp], 0) + gapTotal
    const remaining = containerMain - occupied

    let leading = 0
    let between = mainGap
    const n = this.children.length

    switch (this.justifyContent) {
      case "flex-start":
        break // defaults are fine
      case "flex-end":
        leading = remaining
        break
      case "center":
        leading = remaining / 2
        break
      case "space-between":
        between = n > 1 ? mainGap + remaining / (n - 1) : 0
        break
      case "space-around":
        between = mainGap + remaining / n
        leading = between / 2
        break
      case "space-evenly":
        between = mainGap + remaining / (n + 1)
        leading = between
        break
    }

    // 5. Position children ------------------------------------------------------
    const ordered = this.direction.endsWith("reverse")
      ? [...this.children].reverse()
      : this.children
    let cursor = leading

    for (const child of ordered) {
      if (horizontal) {
        child.position.x =
          this.direction === "row"
            ? cursor
            : containerMain - cursor - child.size.width
        child.position.y = computeCross(
          child,
          crossProp,
          containerCross,
          this.alignItems,
        )
      } else {
        child.position.y =
          this.direction === "column"
            ? cursor
            : containerMain - cursor - child.size.height
        child.position.x = computeCross(
          child,
          crossProp,
          containerCross,
          this.alignItems,
        )
      }
      cursor += child.size[mainProp] + between
    }

    // 6. Recurse into nested flex containers -----------------------------------
    for (const child of this.children) {
      if (child instanceof FlexBox) {
        // Ensure the nested box matches the computed size (already on .size)
        child.build()
      }
    }

    // ---------- helpers ----------
    function computeCross(
      child: FlexNode,
      prop: keyof Size,
      containerCross: number,
      alignItems: Align,
    ): number {
      const alignSelf =
        child.style.alignSelf !== "auto"
          ? (child.style.alignSelf as Align)
          : alignItems
      switch (alignSelf) {
        case "flex-start":
          return 0
        case "flex-end":
          return containerCross - child.size[prop]
        case "center":
          return (containerCross - child.size[prop]) / 2
        case "stretch":
        default:
          return 0
      }
    }
  }
}

// Export types for external use
export type {
  FlexStyle,
  Size,
  Position,
  Direction,
  Justify,
  Align,
  FlexBoxOptions,
} from "./types"

// Root container (same as FlexBox but semantically distinct)
export class RootFlexBox extends FlexBox {
  constructor(width: number, height: number, opts: FlexBoxOptions = {}) {
    super(width, height, opts)
  }

  getLayout(): Record<string, { position: Position; size: Size }> {
    this.build()
    const layoutMap: Record<string, { position: Position; size: Size }> = {}
    this._collectLayout(this, layoutMap)
    return layoutMap
  }

  private _collectLayout(
    box: FlexBox,
    map: Record<string, { position: Position; size: Size }>,
    counterRef = { counter: 0 },
  ): void {
    for (const child of box.children) {
      const id = child.id ?? `_$$${counterRef.counter++}`
      map[id] = { position: child.position, size: child.size }
      if (child instanceof FlexBox) {
        this._collectLayout(child, map, counterRef)
      }
    }
  }
}
