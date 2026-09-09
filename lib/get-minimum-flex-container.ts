import type { FlexBoxOptions, Size } from "./types"

/**
 * Estimates the smallest container for children with explicit dimensions.
 *
 * Children are stacked along the configured direction and separated by the
 * relevant row or column gap. This does not perform flex grow, shrink, or
 * flex-basis sizing.
 */
export function getMinimumFlexContainer(
  children: Array<Size>,
  options: FlexBoxOptions = {},
): Size {
  if (children.length === 0) return { width: 0, height: 0 }

  const direction = options.direction ?? "row"
  const isRowDirection = direction === "row" || direction === "row-reverse"
  const gap = isRowDirection ? (options.columnGap ?? 0) : (options.rowGap ?? 0)
  const totalGap = gap * (children.length - 1)

  if (isRowDirection) {
    return {
      width: children.reduce((sum, child) => sum + child.width, 0) + totalGap,
      height: children.reduce(
        (maximum, child) => Math.max(maximum, child.height),
        0,
      ),
    }
  }

  return {
    width: children.reduce(
      (maximum, child) => Math.max(maximum, child.width),
      0,
    ),
    height: children.reduce((sum, child) => sum + child.height, 0) + totalGap,
  }
}
