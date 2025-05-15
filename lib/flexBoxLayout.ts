import { RootFlexBox } from "."
import type {
  FlexStyle,
  Size,
  Position,
  Direction,
  Justify,
  Align,
} from "./types"

export interface FlexBoxItem extends FlexStyle {
  children?: FlexBoxItem[]
}

export const flexBoxLayout = (
  parent: FlexBoxItem,
): Record<string, { position: Position; size: Size }> => {
  const layout: Record<string, { position: Position; size: Size }> = {}
  const root = new RootFlexBox(parent.width, parent.height, {
    ...parent,
  })
}
