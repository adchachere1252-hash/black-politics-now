import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const adminSource = readFileSync(join(process.cwd(), "client/src/pages/Admin.tsx"), "utf8");
const routerSource = readFileSync(join(process.cwd(), "server/routers.ts"), "utf8");

describe("Black Representation editor save wiring", () => {
  it("submits the persisted status field and waits for the protected mutation before showing success", () => {
    expect(adminSource).toContain('useState(member.status ?? "running")');
    expect(adminSource).toContain("await onSave({ status, primaryResult: primaryResult || null, notes: notes || null })");
    expect(adminSource).toContain("updateCbc.mutateAsync({ id: m.id, data })");
    expect(adminSource).toContain("Saved. The public profile refreshed.");
    expect(adminSource).toContain("Save failed:");
  });

  it("limits profile and contest saves to explicit source-compatible fields", () => {
    expect(routerSource).toContain('Choose at least one supported profile field to save.');
    expect(routerSource).toContain('Choose at least one supported contest field to save.');
    expect(routerSource).toContain('winnerVotePct: z.number().min(0).max(100).nullable().optional()');
  });
});
