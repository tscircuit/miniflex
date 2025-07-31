export interface Size {
  width: number
  height: number
}
export interface Position {
  x: number
  y: number
}

// --- Flex style ---------------------------------------------
export type Direction = "row" | "row-reverse" | "column" | "column-reverse"
export type Align = "flex-start" | "flex-end" | "center" | "stretch"
export type Justify =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly"

export interface FlexStyle {
  id?: string
  flexGrow: number
  flexShrink: number
  flexBasis: number
  /** Overrides containerʼs alignItems. */
  alignSelf?: Align | "auto"
  /** Explicit width for the item. Typically used for cross-axis sizing or fixed-size main axis. */
  width?: number
  /** Explicit height for the item. Typically used for cross-axis sizing or fixed-size main axis. */
  height?: number
  /** Optional metadata that can be attached to any flex item. */
  metadata?: unknown
}

// --- Flex container -----------------------------------------
export interface FlexBoxOptions {
  id?: string
  direction?: Direction
  columnGap?: number
  rowGap?: number
  justifyContent?: Justify
  alignItems?: Align
}
