import type { AtlasOverlayMode } from "@/components/HistoricalUSMap";

export function buildAtlasComparisonUrl(origin: string, path: string, input: { stateCode: string; congress: number; comparisonCongress: number; overlayMode: AtlasOverlayMode }) {
  const parameters = new URLSearchParams();
  parameters.set("state", input.stateCode);
  parameters.set("congress", String(input.congress));
  parameters.set("compare", "1");
  parameters.set("compareCongress", String(input.comparisonCongress));
  if (input.overlayMode !== "boundary") parameters.set("overlay", input.overlayMode);
  return `${origin}${path}?${parameters.toString()}`;
}
