export type AtlasMapColorMode = "boundary" | "party" | "member";
export type AtlasMapParty = "D" | "R" | "O" | null | undefined;

export type AtlasMapLegendItem = { label: string; color: string };

export function getAtlasDistrictFill({ mode, party, hasMember, selected }: { mode: AtlasMapColorMode; party?: AtlasMapParty; hasMember: boolean; selected: boolean }) {
  // Selection is communicated by a neutral outline. It must never overwrite
  // source-backed party, member, or boundary color with the site's gold accent.
  void selected;
  if (mode === "boundary") return "var(--color-no-data)";
  if (mode === "member") return hasMember ? "var(--color-representation)" : "var(--color-no-data)";
  if (party === "D") return "var(--color-solid-d)";
  if (party === "R") return "var(--color-solid-r)";
  if (party === "O") return "var(--color-tossup)";
  return "var(--color-no-data)";
}

export function getAtlasDistrictStroke({ mode, party, selected }: { mode: AtlasMapColorMode; party?: AtlasMapParty; selected: boolean }) {
  if (selected) return "var(--foreground)";
  if (mode === "party" && party === "D") return "var(--color-likely-d)";
  if (mode === "party" && party === "R") return "var(--color-likely-r)";
  if (mode === "party" && party === "O") return "var(--color-tossup)";
  return "var(--muted-foreground)";
}

export function getAtlasMapLegend(mode: AtlasMapColorMode): AtlasMapLegendItem[] {
  if (mode === "boundary") return [{ label: "Validated UCLA district geometry", color: "var(--color-no-data)" }];
  if (mode === "member") return [
    { label: "Verified House member", color: "var(--color-representation)" },
    { label: "No verified roster match", color: "var(--color-no-data)" },
  ];
  return [
    { label: "Democratic", color: "var(--color-solid-d)" },
    { label: "Republican", color: "var(--color-solid-r)" },
    { label: "Other / independent", color: "var(--color-tossup)" },
    { label: "No verified roster match", color: "var(--color-no-data)" },
  ];
}
