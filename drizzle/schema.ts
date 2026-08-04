import {
  int,
  tinyint,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  bigint,
  float,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// ELECTION CENTER TABLES (ported from election-map-2026)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Senate Races ─────────────────────────────────────────────────────────────
export const senateRaces = mysqlTable("senate_races", {
  id: int("id").autoincrement().primaryKey(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  stateName: varchar("state_name", { length: 64 }).notNull(),
  isSpecial: boolean("is_special").default(false).notNull(),
  specialNote: text("special_note"),
  incumbent: varchar("incumbent", { length: 128 }),
  incumbentParty: mysqlEnum("incumbent_party", ["D", "R", "I"]),
  incumbentRetiring: boolean("incumbent_retiring").default(false).notNull(),
  candidate1Name: varchar("candidate1_name", { length: 128 }),
  candidate1Party: mysqlEnum("candidate1_party", ["D", "R", "I", "L", "G"]),
  candidate1Votes: bigint("candidate1_votes", { mode: "number" }).default(0),
  candidate1VotePct: decimal("candidate1_vote_pct", { precision: 5, scale: 2 }),
  candidate2Name: varchar("candidate2_name", { length: 128 }),
  candidate2Party: mysqlEnum("candidate2_party", ["D", "R", "I", "L", "G"]),
  candidate2Votes: bigint("candidate2_votes", { mode: "number" }).default(0),
  candidate2VotePct: decimal("candidate2_vote_pct", { precision: 5, scale: 2 }),
  calledWinner: varchar("called_winner", { length: 128 }),
  calledParty: mysqlEnum("called_party", ["D", "R", "I"]),
  calledAt: bigint("called_at", { mode: "number" }),
  primaryWinner: varchar("primary_winner", { length: 128 }),
  primaryParty: mysqlEnum("primary_party", ["D", "R", "I"]),
  otherCandidateName: text("other_candidate_name"),
  otherCandidateParty: mysqlEnum("other_candidate_party", ["D", "R", "I", "L", "G"]),
  otherVotes: bigint("other_votes", { mode: "number" }).default(0),
  otherVotePct: decimal("other_vote_pct", { precision: 5, scale: 2 }),
  previousParty: mysqlEnum("previous_party", ["D", "R", "I"]),
  rating: mysqlEnum("rating", ["Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R", "Safe D", "Safe R"]),
  status: mysqlEnum("status", ["Scheduled", "Primary", "Primary Runoff", "General", "Called", "Certified"]).default("Scheduled").notNull(),
  primaryDate: varchar("primary_date", { length: 32 }),
  primaryRunoffDate: varchar("primary_runoff_date", { length: 32 }),
  generalDate: varchar("general_date", { length: 32 }).default("November 3, 2026"),
  pctReporting: decimal("pct_reporting", { precision: 5, scale: 2 }).default("0"),
  candidate1Bio: text("candidate1_bio"),
  candidate2Bio: text("candidate2_bio"),
  candidate1Photo: text("candidate1_photo"),
  candidate2Photo: text("candidate2_photo"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SenateRace = typeof senateRaces.$inferSelect;
export type InsertSenateRace = typeof senateRaces.$inferInsert;

// ─── House Races ──────────────────────────────────────────────────────────────
export const houseRaces = mysqlTable("house_races", {
  id: int("id").autoincrement().primaryKey(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  stateName: varchar("state_name", { length: 64 }).notNull(),
  district: int("district").notNull(),
  districtLabel: varchar("district_label", { length: 16 }).notNull(),
  incumbent: varchar("incumbent", { length: 128 }),
  incumbentParty: mysqlEnum("incumbent_party", ["D", "R", "I"]),
  incumbentRetiring: boolean("incumbent_retiring").default(false).notNull(),
  isVacancy: boolean("is_vacancy").default(false).notNull(),
  candidate1Name: varchar("candidate1_name", { length: 128 }),
  candidate1Party: mysqlEnum("candidate1_party", ["D", "R", "I", "L", "G"]),
  candidate1Votes: bigint("candidate1_votes", { mode: "number" }).default(0),
  candidate1VotePct: decimal("candidate1_vote_pct", { precision: 5, scale: 2 }),
  candidate2Name: varchar("candidate2_name", { length: 128 }),
  candidate2Party: mysqlEnum("candidate2_party", ["D", "R", "I", "L", "G"]),
  candidate2Votes: bigint("candidate2_votes", { mode: "number" }).default(0),
  candidate2VotePct: decimal("candidate2_vote_pct", { precision: 5, scale: 2 }),
  calledWinner: varchar("called_winner", { length: 128 }),
  calledParty: mysqlEnum("called_party", ["D", "R", "I"]),
  calledAt: bigint("called_at", { mode: "number" }),
  primaryWinner: varchar("primary_winner", { length: 128 }),
  primaryParty: mysqlEnum("primary_party", ["D", "R", "I"]),
  otherCandidateName: text("other_candidate_name"),
  otherCandidateParty: mysqlEnum("other_candidate_party", ["D", "R", "I", "L", "G"]),
  otherVotes: bigint("other_votes", { mode: "number" }).default(0),
  otherVotePct: decimal("other_vote_pct", { precision: 5, scale: 2 }),
  previousParty: mysqlEnum("previous_party", ["D", "R", "I"]),
  rating: mysqlEnum("rating", ["Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R", "Safe D", "Safe R"]),
  status: mysqlEnum("status", ["Scheduled", "Primary", "Primary Runoff", "General", "Called", "Certified"]).default("Scheduled").notNull(),
  primaryDate: varchar("primary_date", { length: 32 }),
  generalDate: varchar("general_date", { length: 32 }).default("November 3, 2026"),
  pctReporting: decimal("pct_reporting", { precision: 5, scale: 2 }).default("0"),
  candidate1Bio: text("candidate1_bio"),
  candidate2Bio: text("candidate2_bio"),
  candidate1Photo: text("candidate1_photo"),
  candidate2Photo: text("candidate2_photo"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type HouseRace = typeof houseRaces.$inferSelect;
export type InsertHouseRace = typeof houseRaces.$inferInsert;

// ─── Governor Races ─────────────────────────────────────────────────────────
export const governorRaces = mysqlTable("governor_races", {
  id: int("id").autoincrement().primaryKey(),
  stateCode: varchar("state_code", { length: 2 }).notNull().unique(),
  stateName: varchar("state_name", { length: 64 }).notNull(),
  incumbentName: varchar("incumbent_name", { length: 128 }),
  incumbentParty: mysqlEnum("incumbent_party", ["D", "R", "I"]),
  isOpen: boolean("is_open").default(false).notNull(),
  isTermLimited: boolean("is_term_limited").default(false).notNull(),
  previousParty: mysqlEnum("previous_party", ["D", "R", "I"]).notNull(),
  rating: mysqlEnum("rating", ["Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R"]).notNull().default("Solid R"),
  primaryDate: varchar("primary_date", { length: 64 }),
  runoffDate: varchar("runoff_date", { length: 64 }),
  generalDate: varchar("general_date", { length: 64 }).notNull().default("November 3, 2026"),
  isSpecial: boolean("is_special").default(false).notNull(),
  status: mysqlEnum("status", ["Scheduled", "Voting", "Primary Runoff", "Called", "Certified"]).default("Scheduled").notNull(),
  calledParty: mysqlEnum("called_party", ["D", "R", "I"]),
  calledWinner: varchar("called_winner", { length: 128 }),
  calledAt: bigint("called_at", { mode: "number" }),
  primaryWinner: varchar("primary_winner", { length: 128 }),
  primaryParty: mysqlEnum("primary_party", ["D", "R", "I"]),
  demVotes: bigint("dem_votes", { mode: "number" }).default(0),
  repVotes: bigint("rep_votes", { mode: "number" }).default(0),
  otherCandidateName: text("other_candidate_name"),
  otherCandidateParty: mysqlEnum("other_candidate_party", ["D", "R", "I", "L", "G"]),
  otherVotes: bigint("other_votes", { mode: "number" }).default(0),
  otherVotePct: decimal("other_vote_pct", { precision: 5, scale: 2 }),
  pctReporting: decimal("pct_reporting", { precision: 5, scale: 2 }).default("0"),
  demCandidate: varchar("dem_candidate", { length: 128 }),
  repCandidate: varchar("rep_candidate", { length: 128 }),
  demPreviousOffice: varchar("dem_previous_office", { length: 256 }),
  repPreviousOffice: varchar("rep_previous_office", { length: 256 }),
  demBio: text("dem_bio"),
  repBio: text("rep_bio"),
  demPhoto: text("dem_photo"),
  repPhoto: text("rep_photo"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type GovernorRace = typeof governorRaces.$inferSelect;
export type InsertGovernorRace = typeof governorRaces.$inferInsert;

// ─── Referendums ──────────────────────────────────────────────────────────────
export const referendums = mysqlTable("referendums", {
  id: int("id").autoincrement().primaryKey(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  stateName: varchar("state_name", { length: 64 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  measureType: varchar("measure_type", { length: 64 }),
  measureTypeFull: varchar("measure_type_full", { length: 256 }),
  scope: varchar("scope", { length: 16 }).default("state"),
  country: varchar("country", { length: 128 }).default("United States"),
  countryCode: varchar("country_code", { length: 3 }).default("US"),
  yesLabel: varchar("yes_label", { length: 128 }).default("Yes"),
  noLabel: varchar("no_label", { length: 128 }).default("No"),
  yesVotes: bigint("yes_votes", { mode: "number" }).default(0),
  noVotes: bigint("no_votes", { mode: "number" }).default(0),
  pctReporting: decimal("pct_reporting", { precision: 5, scale: 2 }).default("0"),
  electionDate: varchar("election_date", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["Scheduled", "Voting", "Called", "Certified"]).default("Scheduled").notNull(),
  calledResult: mysqlEnum("called_result", ["Yes", "No"]),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Referendum = typeof referendums.$inferSelect;
export type InsertReferendum = typeof referendums.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// PODCAST TABLES (ported from daily-podcast)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Episodes ────────────────────────────────────────────────────────────────
export const episodes = mysqlTable("episodes", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(),
  day: varchar("day", { length: 16 }),
  friendlyDate: varchar("friendlyDate", { length: 64 }),
  totalDurationSec: int("totalDurationSec"),
  totalDurationLabel: varchar("totalDurationLabel", { length: 16 }),
  segmentCount: int("segmentCount"),
  fullEpisodeCdnUrl: text("fullEpisodeCdnUrl"),
  verificationStatus: mysqlEnum("verificationStatus", ["passed", "warnings", "pending"]).default("pending"),
  verificationWarnings: text("verificationWarnings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = typeof episodes.$inferInsert;

// ─── Episode Segments ────────────────────────────────────────────────────────
export const episodeSegments = mysqlTable("episode_segments", {
  id: int("id").autoincrement().primaryKey(),
  episodeDate: varchar("episodeDate", { length: 10 }).notNull(),
  segmentKey: varchar("segmentKey", { length: 64 }).notNull(),
  label: varchar("label", { length: 128 }),
  emoji: varchar("emoji", { length: 8 }),
  durationSec: float("durationSec"),
  durationLabel: varchar("durationLabel", { length: 16 }),
  andrewCdnUrl: text("andrewCdnUrl"),
  jennyCdnUrl: text("jennyCdnUrl"),
  script: text("script"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isBreaking: tinyint("isBreaking").default(0).notNull(),
  breakingReason: varchar("breakingReason", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EpisodeSegment = typeof episodeSegments.$inferSelect;
export type InsertEpisodeSegment = typeof episodeSegments.$inferInsert;

// ─── Pipeline Runs ───────────────────────────────────────────────────────────
export const pipelineRuns = mysqlTable("pipeline_runs", {
  id: int("id").autoincrement().primaryKey(),
  episodeDate: varchar("episodeDate", { length: 10 }).notNull(),
  status: mysqlEnum("status", ["running", "success", "failed"]).notNull(),
  triggeredBy: mysqlEnum("triggeredBy", ["scheduler", "manual"]).default("scheduler").notNull(),
  segmentCount: int("segmentCount"),
  totalDurationSec: int("totalDurationSec"),
  durationMs: int("durationMs"),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type PipelineRun = typeof pipelineRuns.$inferSelect;
export type InsertPipelineRun = typeof pipelineRuns.$inferInsert;

// ─── Podcast Play Analytics ──────────────────────────────────────────────────
export const podcastPlays = mysqlTable("podcast_plays", {
  id: int("id").autoincrement().primaryKey(),
  episodeDate: varchar("episodeDate", { length: 10 }).notNull(),
  segmentKey: varchar("segmentKey", { length: 64 }).notNull(),
  segmentLabel: varchar("segmentLabel", { length: 128 }),
  durationSec: int("durationSec"),
  listenedSec: int("listenedSec"),
  sessionId: varchar("sessionId", { length: 64 }),
  userAgent: varchar("userAgent", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PodcastPlay = typeof podcastPlays.$inferSelect;
export type InsertPodcastPlay = typeof podcastPlays.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED PLATFORM TABLES (new)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Email Subscribers (notifications for episodes + race calls) ─────────────
export const emailSubscribers = mysqlTable("email_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 128 }),
  active: boolean("active").default(true).notNull(),
  notifyEpisodes: boolean("notifyEpisodes").default(true).notNull(),
  notifyRaceCalls: boolean("notifyRaceCalls").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastEmailedAt: timestamp("lastEmailedAt"),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = typeof emailSubscribers.$inferInsert;

// ─── News Cache (WordPress REST API responses) ───────────────────────────────
export const newsCache = mysqlTable("news_cache", {
  id: int("id").autoincrement().primaryKey(),
  cacheKey: varchar("cacheKey", { length: 256 }).notNull().unique(),
  payload: text("payload"),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
});

export type NewsCacheRow = typeof newsCache.$inferSelect;
