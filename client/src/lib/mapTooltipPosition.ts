export type MapTooltipAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const HORIZONTAL_INSET = 112;
const TOP_INSET = 10;
const TOOLTIP_HEIGHT = 156;
const VERTICAL_OFFSET = 114;

export function getBoundedMapTooltipPosition({ x, y, width, height }: MapTooltipAnchor) {
  return {
    x: Math.min(Math.max(HORIZONTAL_INSET, x), Math.max(HORIZONTAL_INSET, width - HORIZONTAL_INSET)),
    y: Math.min(Math.max(TOP_INSET, y - VERTICAL_OFFSET), Math.max(TOP_INSET, height - TOOLTIP_HEIGHT)),
  };
}
