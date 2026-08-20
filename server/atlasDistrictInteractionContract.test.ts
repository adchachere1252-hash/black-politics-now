import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const mapSource = readFileSync(new URL("../client/src/components/HistoricalUSMap.tsx", import.meta.url), "utf8");
const pageSource = readFileSync(new URL("../client/src/pages/Atlas.tsx", import.meta.url), "utf8");

describe("Historical Atlas district interaction contract", () => {
  it("keeps pointer and keyboard district activation connected to the typed selection callback", () => {
    expect(mapSource).toContain("svg.addEventListener(\"pointerup\", handleNativePointerUp)");
    expect(mapSource).toContain("data-atlas-path-key={path.key}");
    expect(mapSource).toContain("onKeyDown={(event) => { if (event.key === \"Enter\" || event.key === \" \") { event.preventDefault(); selectDistrict(path); } }}");
    expect(mapSource).toContain("const selection = atlasDistrictSelection({");
    expect(mapSource).toContain("if (onDistrictSelect) onDistrictSelect(selection);");
  });

  it("keeps the Atlas page wired to render a source-linked selected-district panel", () => {
    expect(pageSource).toContain("onDistrictSelect={selectAtlasDistrict}");
    expect(pageSource).toContain("<DistrictDetailPanel district={selectedDistrict}");
    expect(pageSource).toContain("UCLA feature ID");
    expect(pageSource).toContain("Voteview House data");
  });
});
