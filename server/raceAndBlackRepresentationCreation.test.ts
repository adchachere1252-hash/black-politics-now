import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const electionDb = readFileSync(new URL("./electionDb.ts", import.meta.url), "utf8");
const cbcDb = readFileSync(new URL("./cbcDb.ts", import.meta.url), "utf8");
const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const admin = readFileSync(new URL("../client/src/pages/Admin.tsx", import.meta.url), "utf8");
const candidateChanges = readFileSync(new URL("../client/src/components/CandidateChangesTab.tsx", import.meta.url), "utf8");
const atlasMap = readFileSync(new URL("../client/src/components/HistoricalUSMap.tsx", import.meta.url), "utf8");

describe("manual race and Black Representation creation contract", () => {
  it("requires protected source-backed creation for all public election race types", () => {
    expect(router).toContain("createSenateRace: adminProcedure");
    expect(router).toContain("createHouseRace: adminProcedure");
    expect(router).toContain("createGovernorRace: adminProcedure");
    expect(electionDb).toContain("createSenateRace");
    expect(electionDb).toContain("createHouseRace");
    expect(electionDb).toContain("createGovernorRace");
    expect(electionDb).toContain("Initial contest creation");
    expect(candidateChanges).toContain("Add race");
    expect(candidateChanges).toContain("CreateRaceForm");
  });

  it("requires source evidence and records immutable additions for Black Representation profiles and map contests", () => {
    expect(schema).toContain('blackRepresentationAdditionAudit = mysqlTable("black_representation_addition_audit"');
    expect(router).toContain("createBlackRepresentationProfile: adminProcedure");
    expect(router).toContain("createBlackRepresentationContest: adminProcedure");
    expect(cbcDb).toContain("createBlackRepresentationProfile");
    expect(cbcDb).toContain("createBlackRepresentationContest");
    expect(cbcDb).toContain("validateAdditionSource");
    expect(router).toContain("district: z.string().min(1).max(128)");
    expect(schema).toContain('district: varchar("district", { length: 128 }).notNull()');
    expect(admin).toContain("Add Black Rep profile");
    expect(admin).toContain("Add Black Rep race");
    expect(admin).toContain("Create source-backed profile");
    expect(admin).toContain("Create source-backed race");
    expect(admin).toContain("createProfile.mutate(input)");
    expect(admin).toContain("utils.election.cbc.invalidate()");
    expect(cbcDb).toContain("return db.transaction(async (tx) => {");
    expect(cbcDb).toContain('targetType: "black_representation_profile"');
  });

  it("uses white state separators over colored Atlas layers without making them a boundary-data category", () => {
    expect(atlasMap).toContain('"rgba(255, 255, 255, 0.92)"');
    expect(atlasMap).toContain("White state separators");
    expect(atlasMap).toContain("stateBoundaries");
  });
});
