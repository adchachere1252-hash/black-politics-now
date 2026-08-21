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
  index,
  uniqueIndex,
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

/**
 * Anonymous public-site visits. Session tokens are hashed before persistence;
 * the application deliberately stores no IP address, raw user agent, account
 * identity, query string, or full referrer URL.
 */
export const siteAnalyticsEvents = mysqlTable("site_analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  pagePath: varchar("page_path", { length: 512 }).notNull(),
  sessionHash: varchar("session_hash", { length: 64 }).notNull(),
  deviceType: mysqlEnum("device_type", ["desktop", "tablet", "mobile"]).notNull(),
  referrerHost: varchar("referrer_host", { length: 255 }),
  visitedAt: timestamp("visited_at").defaultNow().notNull(),
}, (table) => [
  index("site_analytics_visited_at_idx").on(table.visitedAt),
  index("site_analytics_page_visited_idx").on(table.pagePath, table.visitedAt),
  index("site_analytics_session_visited_idx").on(table.sessionHash, table.visitedAt),
]);

export type SiteAnalyticsEvent = typeof siteAnalyticsEvents.$inferSelect;

/**
 * Bounded operational telemetry for failed public queries. It stores no request
 * body, session value, or user identity; it is used only for Admin health review.
 */
export const homepageQueryTelemetry = mysqlTable("homepage_query_telemetry", {
  id: int("id").autoincrement().primaryKey(),
  queryPath: varchar("query_path", { length: 160 }).notNull(),
  attempt: tinyint("attempt").notNull().default(1),
  errorCategory: varchar("error_category", { length: 120 }).notNull(),
  observedAt: timestamp("observed_at").defaultNow().notNull(),
}, (table) => [
  index("homepage_query_telemetry_observed_idx").on(table.observedAt),
  index("homepage_query_telemetry_path_observed_idx").on(table.queryPath, table.observedAt),
]);

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
  calledSourceUrl: varchar("called_source_url", { length: 2048 }),
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
  candidateSourceUrl: varchar("candidate_source_url", { length: 2048 }),
  candidateSourceLabel: varchar("candidate_source_label", { length: 256 }),
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

/**
 * A single durable heartbeat written only by the existing election engine.
 * It supplies operational health context to administrators and has no public
 * race-writing or call-making role.
 */
export const electionDayStatus = mysqlTable("election_day_status", {
  id: int("id").primaryKey(),
  mode: mysqlEnum("mode", ["standby", "active", "degraded"]).notNull().default("standby"),
  sourceName: varchar("source_name", { length: 64 }).notNull().default("DDHQ"),
  activeDate: varchar("active_date", { length: 16 }),
  heartbeatAt: timestamp("heartbeat_at"),
  lastPollAt: timestamp("last_poll_at"),
  mappedRaces: int("mapped_races").notNull().default(0),
  updatedRaces: int("updated_races").notNull().default(0),
  failedPolls: int("failed_polls").notNull().default(0),
  newCalls: int("new_calls").notNull().default(0),
  sourceHealth: mysqlEnum("source_health", ["unknown", "healthy", "degraded"]).notNull().default("unknown"),
  lastSummary: text("last_summary"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ElectionDayStatus = typeof electionDayStatus.$inferSelect;

/**
 * Private operational rehearsal records. These are runbook exercises only and
 * are intentionally not connected to public election results or alerts.
 */
export const electionDayRehearsals = mysqlTable("election_day_rehearsals", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", ["running", "completed", "cancelled"]).notNull().default("running"),
  scenario: varchar("scenario", { length: 256 }).notNull(),
  startedBy: varchar("started_by", { length: 128 }).notNull(),
  steps: text("steps").notNull(),
  notes: text("notes"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ElectionDayRehearsal = typeof electionDayRehearsals.$inferSelect;

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
  candidateSourceUrl: varchar("candidate_source_url", { length: 2048 }),
  candidateSourceLabel: varchar("candidate_source_label", { length: 256 }),
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
  calledSourceUrl: varchar("called_source_url", { length: 2048 }),
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
  calledSourceUrl: varchar("called_source_url", { length: 2048 }),
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
  candidateSourceUrl: varchar("candidate_source_url", { length: 2048 }),
  candidateSourceLabel: varchar("candidate_source_label", { length: 256 }),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type GovernorRace = typeof governorRaces.$inferSelect;
export type InsertGovernorRace = typeof governorRaces.$inferInsert;

/**
 * Immutable record of an administrator's manual general-election candidate
 * update. It records the source and prior values without changing results.
 */
export const governorCandidateEdits = mysqlTable("governor_candidate_edits", {
  id: int("id").autoincrement().primaryKey(),
  governorRaceId: int("governor_race_id").notNull(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  demCandidate: varchar("dem_candidate", { length: 128 }),
  repCandidate: varchar("rep_candidate", { length: 128 }),
  sourceUrl: varchar("source_url", { length: 2048 }).notNull(),
  sourceLabel: varchar("source_label", { length: 256 }).notNull(),
  editorName: varchar("editor_name", { length: 128 }).notNull(),
  editorNote: text("editor_note"),
  previousValue: text("previous_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("governor_candidate_edits_race_created_idx").on(table.governorRaceId, table.createdAt),
]);

export type GovernorCandidateEdit = typeof governorCandidateEdits.$inferSelect;

/**
 * Immutable evidence-backed record of a human result confirmation made through
 * the Election Results Control Room. It is separate from automated source
 * polling and preserves the prior public race state for later reconciliation.
 */
export const electionResultConfirmations = mysqlTable("election_result_confirmations", {
  id: int("id").autoincrement().primaryKey(),
  raceType: mysqlEnum("race_type", ["senate", "house", "governor"]).notNull(),
  raceId: int("race_id").notNull(),
  jurisdiction: varchar("jurisdiction", { length: 160 }).notNull(),
  winnerName: varchar("winner_name", { length: 128 }).notNull(),
  winnerParty: mysqlEnum("winner_party", ["D", "R", "I"]).notNull(),
  sourceUrl: varchar("source_url", { length: 2048 }).notNull(),
  sourceLabel: varchar("source_label", { length: 256 }).notNull(),
  confirmationNote: text("confirmation_note"),
  confirmedBy: varchar("confirmed_by", { length: 128 }).notNull(),
  priorValue: text("prior_value").notNull(),
  confirmedAt: timestamp("confirmed_at").defaultNow().notNull(),
}, (table) => [
  index("election_result_confirmations_race_idx").on(table.raceType, table.raceId, table.confirmedAt),
  index("election_result_confirmations_confirmed_at_idx").on(table.confirmedAt),
]);

export type ElectionResultConfirmation = typeof electionResultConfirmations.$inferSelect;

/**
 * Administrator-managed general-election outcomes that may supplement the
 * race-derived public ticker. Entries are source-backed and never represent
 * primary or runoff results.
 */
export const electionTickerEntries = mysqlTable("election_ticker_entries", {
  id: int("id").autoincrement().primaryKey(),
  jurisdiction: varchar("jurisdiction", { length: 160 }).notNull(),
  chamber: mysqlEnum("chamber", ["Senate", "House", "Governor"]).notNull(),
  winnerName: varchar("winner_name", { length: 128 }).notNull(),
  winnerParty: mysqlEnum("winner_party", ["D", "R", "I", "L", "G"]).notNull(),
  sourceUrl: varchar("source_url", { length: 2048 }).notNull(),
  sourceLabel: varchar("source_label", { length: 256 }).notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("election_ticker_entries_active_order_idx").on(table.isActive, table.sortOrder, table.id),
]);

/** Immutable source-backed record of every ticker create, edit, reorder, or removal. */
export const electionTickerEntryEdits = mysqlTable("election_ticker_entry_edits", {
  id: int("id").autoincrement().primaryKey(),
  tickerEntryId: int("ticker_entry_id").notNull(),
  action: mysqlEnum("action", ["created", "updated", "reordered", "removed"]).notNull(),
  sourceUrl: varchar("source_url", { length: 2048 }).notNull(),
  sourceLabel: varchar("source_label", { length: 256 }).notNull(),
  editorName: varchar("editor_name", { length: 128 }).notNull(),
  editorNote: text("editor_note"),
  previousValue: text("previous_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("election_ticker_entry_edits_entry_created_idx").on(table.tickerEntryId, table.createdAt),
]);

export type ElectionTickerEntry = typeof electionTickerEntries.$inferSelect;
export type ElectionTickerEntryEdit = typeof electionTickerEntryEdits.$inferSelect;

/** Immutable administrator record for manual Senate and House candidate-log updates. */
export const electionCandidateEdits = mysqlTable("election_candidate_edits", {
  id: int("id").autoincrement().primaryKey(),
  contestType: mysqlEnum("contest_type", ["senate", "house"]).notNull(),
  contestId: int("contest_id").notNull(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  districtLabel: varchar("district_label", { length: 16 }),
  candidate1Name: varchar("candidate1_name", { length: 128 }),
  candidate1Party: mysqlEnum("candidate1_party", ["D", "R", "I", "L", "G"]),
  candidate2Name: varchar("candidate2_name", { length: 128 }),
  candidate2Party: mysqlEnum("candidate2_party", ["D", "R", "I", "L", "G"]),
  sourceUrl: varchar("source_url", { length: 2048 }).notNull(),
  sourceLabel: varchar("source_label", { length: 256 }).notNull(),
  editorName: varchar("editor_name", { length: 128 }).notNull(),
  editorNote: text("editor_note"),
  previousValue: text("previous_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("election_candidate_edits_contest_created_idx").on(table.contestType, table.contestId, table.createdAt),
]);

export type ElectionCandidateEdit = typeof electionCandidateEdits.$inferSelect;

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

// ─── Certified Results Archive ────────────────────────────────────────────────
/**
 * A published, immutable-in-application snapshot of results confirmed by an
 * election authority. The application intentionally exposes no update or
 * delete procedure for this ledger.
 */
export const certifiedResultArchives = mysqlTable("certified_result_archives", {
  id: int("id").autoincrement().primaryKey(),
  archiveKey: varchar("archive_key", { length: 96 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  certificationAuthority: varchar("certification_authority", { length: 256 }).notNull(),
  certificationSourceUrl: varchar("certification_source_url", { length: 2048 }).notNull(),
  certificationStatement: text("certification_statement").notNull(),
  certifiedAt: timestamp("certified_at").notNull(),
  certifiedBy: varchar("certified_by", { length: 128 }).notNull(),
  snapshotDigest: varchar("snapshot_digest", { length: 64 }).notNull(),
  entryCount: int("entry_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("certified_results_archive_certified_at_idx").on(table.certifiedAt)]);

export type CertifiedResultArchive = typeof certifiedResultArchives.$inferSelect;

/** Exact result payloads captured at certification time, never re-read from live race tables for public archive detail. */
export const certifiedResultArchiveEntries = mysqlTable("certified_result_archive_entries", {
  id: int("id").autoincrement().primaryKey(),
  archiveId: int("archive_id").notNull(),
  chamber: mysqlEnum("chamber", ["Senate", "House", "Governor", "Referendum"]).notNull(),
  sourceRecordId: int("source_record_id").notNull(),
  contestKey: varchar("contest_key", { length: 128 }).notNull(),
  jurisdiction: varchar("jurisdiction", { length: 128 }).notNull(),
  resultLabel: varchar("result_label", { length: 256 }).notNull(),
  winnerOrResult: varchar("winner_or_result", { length: 256 }).notNull(),
  partyOrSide: varchar("party_or_side", { length: 32 }),
  sourceUrl: varchar("source_url", { length: 2048 }).notNull(),
  snapshotJson: text("snapshot_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("certified_results_archive_entry_unique").on(table.archiveId, table.chamber, table.sourceRecordId),
  index("certified_results_archive_entry_archive_idx").on(table.archiveId, table.chamber),
]);

export type CertifiedResultArchiveEntry = typeof certifiedResultArchiveEntries.$inferSelect;

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
  jennyFullEpisodeCdnUrl: text("jennyFullEpisodeCdnUrl"),
  verificationStatus: mysqlEnum("verificationStatus", ["passed", "warnings", "pending"]).default("pending"),
  verificationWarnings: text("verificationWarnings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = typeof episodes.$inferInsert;

// ─── Podcast Recovery Requests ───────────────────────────────────────────────
// A durable, admin-created audio repair request. The cloud automation consumes
// queued requests and may only mark a request complete after both full voices pass.
export const podcastRecoveryRequests = mysqlTable("podcast_recovery_requests", {
  id: int("id").autoincrement().primaryKey(),
  episodeDate: varchar("episode_date", { length: 10 }).notNull(),
  recoveryMode: mysqlEnum("recovery_mode", ["audio_repair", "full_guard"]).notNull().default("audio_repair"),
  status: mysqlEnum("status", ["queued", "running", "completed", "held", "failed"]).default("queued").notNull(),
  requestedBy: varchar("requested_by", { length: 128 }).notNull(),
  note: text("note"),
  resultMessage: text("result_message"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  handledAt: timestamp("handled_at"),
});

export type PodcastRecoveryRequest = typeof podcastRecoveryRequests.$inferSelect;

// ─── Episode Segments ────────────────────────────────────────────────────────
export const episodeSegments = mysqlTable("episode_segments", {
  id: int("id").autoincrement().primaryKey(),
  episodeDate: varchar("episodeDate", { length: 10 }).notNull(),
  segmentKey: varchar("segmentKey", { length: 64 }).notNull(),
  label: varchar("label", { length: 128 }),
  sourceLinks: text("sourceLinks"),
  sourceVerifiedAt: timestamp("sourceVerifiedAt"),
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

// ─── Daily Brief Source Preflights ───────────────────────────────────────────
// Recorded by the cloud automation before the morning generator is allowed to
// start. The report is intentionally operational metadata, not public content.
export const podcastPreflights = mysqlTable("podcast_preflights", {
  id: int("id").autoincrement().primaryKey(),
  episodeDate: varchar("episode_date", { length: 10 }).notNull().unique(),
  status: varchar("status", { length: 16 }).notNull(),
  topicCount: int("topic_count").notNull().default(0),
  readyCount: int("ready_count").notNull().default(0),
  report: text("report"),
  checkedAt: timestamp("checked_at").defaultNow().onUpdateNow().notNull(),
});

export type PodcastPreflight = typeof podcastPreflights.$inferSelect;

// ─── Daily Brief Missed-Gate Alerts ──────────────────────────────────────────
// One durable row per date makes the 6:30 AM owner alert idempotent and gives
// Podcast Ops a trustworthy record of the most recent gate assessment.
export const podcastGateAlerts = mysqlTable("podcast_gate_alerts", {
  id: int("id").autoincrement().primaryKey(),
  episodeDate: varchar("episode_date", { length: 10 }).notNull().unique(),
  gateStatus: mysqlEnum("gate_status", ["passed", "alert_sent", "alert_failed"]).notNull(),
  preflightStatus: varchar("preflight_status", { length: 16 }),
  message: text("message").notNull(),
  notificationSent: boolean("notification_sent").default(false).notNull(),
  notifiedAt: timestamp("notified_at"),
  checkedAt: timestamp("checked_at").defaultNow().onUpdateNow().notNull(),
});

export type PodcastGateAlert = typeof podcastGateAlerts.$inferSelect;

// ─── Podcast Publishing Kit ──────────────────────────────────────────────────
// These records are human-reviewable drafts derived only from an episode's stored
// segments and source links. They do not publish or alter editorial content.
export const podcastShowNotes = mysqlTable("podcast_show_notes", {
  id: int("id").autoincrement().primaryKey(),
  episodeDate: varchar("episode_date", { length: 10 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  summary: text("summary").notNull(),
  showNotes: text("show_notes").notNull(),
  keywords: text("keywords").notNull(),
  updatedBy: varchar("updated_by", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PodcastShowNote = typeof podcastShowNotes.$inferSelect;

// ─── Privacy-limited Podcast Playback Events ─────────────────────────────────
// Keeps the original repository's plays analytics without retaining IP address,
// raw user agent, account identity, or an unhashed browser session identifier.
export const podcastPlayEvents = mysqlTable("podcast_play_events", {
  id: int("id").autoincrement().primaryKey(),
  episodeDate: varchar("episode_date", { length: 10 }).notNull(),
  segmentKey: varchar("segment_key", { length: 64 }),
  segmentLabel: varchar("segment_label", { length: 128 }),
  playbackKind: mysqlEnum("playback_kind", ["episode", "segment"]).notNull(),
  voice: mysqlEnum("voice", ["andrew", "jenny"]).notNull(),
  sessionHash: varchar("session_hash", { length: 64 }).notNull(),
  playedAt: timestamp("played_at").defaultNow().notNull(),
}, (table) => [
  index("podcast_play_events_played_at_idx").on(table.playedAt),
  index("podcast_play_events_episode_idx").on(table.episodeDate),
  index("podcast_play_events_segment_idx").on(table.segmentKey),
]);

export type PodcastPlayEvent = typeof podcastPlayEvents.$inferSelect;

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

// ═══════════════════════════════════════════════════════════════════════════
// REDISTRICTING + WORLD ELECTIONS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Redistricting States ───────────────────────────────────────────────────
export const redistrictingStates = mysqlTable("redistricting_states", {
  id: int("id").autoincrement().primaryKey(),
  stateCode: varchar("state_code", { length: 2 }).notNull().unique(),
  stateName: varchar("state_name", { length: 64 }).notNull(),
  enacted: boolean("enacted").default(false).notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 128 }),
  method: varchar("method", { length: 128 }),
  delegationBefore: varchar("delegation_before", { length: 64 }),
  projectedImpact: varchar("projected_impact", { length: 64 }),
  litigationNotes: text("litigation_notes"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type RedistrictingState = typeof redistrictingStates.$inferSelect;
export type InsertRedistrictingState = typeof redistrictingStates.$inferInsert;

// ─── World Elections ────────────────────────────────────────────────────────
export const worldElections = mysqlTable("world_elections", {
  id: int("id").autoincrement().primaryKey(),
  country: varchar("country", { length: 128 }).notNull(),
  countryCode: varchar("country_code", { length: 3 }).notNull(),
  electionType: mysqlEnum("election_type", [
    "Presidential", "Parliamentary", "Referendum", "Legislative", "Local"
  ]).notNull(),
  electionName: varchar("election_name", { length: 256 }).notNull(),
  electionDate: varchar("election_date", { length: 16 }).notNull(),
  endDate: varchar("end_date", { length: 16 }),
  status: mysqlEnum("world_election_status", [
    "Upcoming", "Voting Today", "Completed", "Postponed", "Cancelled"
  ]).notNull().default("Upcoming"),
  isDateConfirmed: boolean("is_date_confirmed").default(true).notNull(),
  isSnap: boolean("is_snap").default(false).notNull(),
  incumbent: varchar("incumbent", { length: 256 }),
  incumbentParty: varchar("incumbent_party", { length: 128 }),
  systemType: varchar("system_type", { length: 128 }),
  termLength: varchar("term_length", { length: 64 }),
  candidates: text("candidates"),
  pollingData: text("polling_data"),
  keyIssues: text("key_issues"),
  winner: varchar("winner", { length: 256 }),
  winnerParty: varchar("winner_party", { length: 128 }),
  totalVotes: bigint("total_votes", { mode: "number" }),
  turnoutPct: decimal("turnout_pct", { precision: 5, scale: 2 }),
  notes: text("notes"),
  sourceUrls: text("source_urls"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type WorldElection = typeof worldElections.$inferSelect;
export type InsertWorldElection = typeof worldElections.$inferInsert;

/**
 * A source-watch is deliberately review-only: it captures authoritative-source
 * changes and creates an Agent Desk recommendation, but never mutates a public
 * winner, result, or calendar record.
 */
export const worldElectionWatches = mysqlTable("world_election_watches", {
  id: int("id").autoincrement().primaryKey(),
  worldElectionId: int("world_election_id").notNull().unique(),
  enabled: boolean("enabled").default(true).notNull(),
  scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
  lastCheckedAt: timestamp("last_checked_at"),
  lastFingerprint: varchar("last_fingerprint", { length: 64 }),
  lastSourceSnapshot: text("last_source_snapshot"),
  lastReviewRecommendationId: int("last_review_recommendation_id"),
  lastDetectedAt: timestamp("last_detected_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type WorldElectionWatch = typeof worldElectionWatches.$inferSelect;

/**
 * Singleton settings for the dated World Elections refresh workflow. The
 * workflow may create review recommendations but never alters public election
 * dates, statuses, candidates, or results without an editor.
 */
export const worldElectionRefreshSettings = mysqlTable("world_election_refresh_settings", {
  id: int("id").primaryKey(),
  enabled: boolean("enabled").default(true).notNull(),
  scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
  lastRunAt: timestamp("last_run_at"),
  lastSuccessAt: timestamp("last_success_at"),
  lastSummary: text("last_summary"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type WorldElectionRefreshSettings = typeof worldElectionRefreshSettings.$inferSelect;

/**
 * Latest source fingerprint for each record selected by the dated refresh.
 * This is audit metadata only: it exists to detect changes and route those
 * changes for human review rather than mutating the public election record.
 */
export const worldElectionRefreshItems = mysqlTable("world_election_refresh_items", {
  id: int("id").autoincrement().primaryKey(),
  worldElectionId: int("world_election_id").notNull().unique(),
  lastFingerprint: varchar("last_fingerprint", { length: 64 }),
  lastCheckedAt: timestamp("last_checked_at"),
  lastChangedAt: timestamp("last_changed_at"),
  lastStatus: varchar("last_status", { length: 32 }),
  lastSourceSnapshot: text("last_source_snapshot"),
  lastRecommendationId: int("last_recommendation_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type WorldElectionRefreshItem = typeof worldElectionRefreshItems.$inferSelect;

/**
 * Editor-submitted candidate portrait candidates. A submission cannot affect a
 * public race or Black Representation profile until a named administrator
 * approves it after reviewing provenance.
 */
export const candidatePortraitSubmissions = mysqlTable("candidate_portrait_submissions", {
  id: int("id").autoincrement().primaryKey(),
  targetType: mysqlEnum("target_type", ["senate", "house", "governor", "black_representation"]).notNull(),
  targetRecordId: int("target_record_id").notNull(),
  targetPhotoField: mysqlEnum("target_photo_field", ["candidate1", "candidate2", "dem", "rep", "profile"]).notNull(),
  candidateName: varchar("candidate_name", { length: 128 }).notNull(),
  imageUrl: text("image_url").notNull(),
  sourceUrl: text("source_url").notNull(),
  provenanceType: mysqlEnum("provenance_type", ["official_campaign", "official_government", "bioguide", "licensed_media", "other_verified"]).notNull(),
  submissionNote: text("submission_note"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  submittedBy: varchar("submitted_by", { length: 128 }).notNull(),
  reviewedBy: varchar("reviewed_by", { length: 128 }),
  reviewedAt: timestamp("reviewed_at"),
  reviewNote: text("review_note"),
  appliedPhotoUrl: text("applied_photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CandidatePortraitSubmission = typeof candidatePortraitSubmissions.$inferSelect;

/**
 * An administrator-started batch for private portrait-source research. A batch
 * creates review artifacts only; it never submits or applies a public photo.
 */
export const portraitResearchBatches = mysqlTable("portrait_research_batches", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", ["running", "completed", "completed_with_failures"]).notNull().default("running"),
  requestedBy: varchar("requested_by", { length: 128 }).notNull(),
  totalTargets: int("total_targets").notNull(),
  completedTargets: int("completed_targets").notNull().default(0),
  failedTargets: int("failed_targets").notNull().default(0),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  summary: text("summary"),
});

export const portraitResearchBatchItems = mysqlTable("portrait_research_batch_items", {
  id: int("id").autoincrement().primaryKey(),
  batchId: int("batch_id").notNull(),
  targetType: mysqlEnum("target_type", ["senate", "house", "governor", "black_representation"]).notNull(),
  targetRecordId: int("target_record_id").notNull(),
  targetPhotoField: mysqlEnum("target_photo_field", ["candidate1", "candidate2", "dem", "rep", "profile"]).notNull(),
  candidateName: varchar("candidate_name", { length: 128 }).notNull(),
  location: varchar("location", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["queued", "in_progress", "ready_for_review", "blocked", "skipped"]).notNull().default("queued"),
  agentTaskId: int("agent_task_id"),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export type PortraitResearchBatch = typeof portraitResearchBatches.$inferSelect;
export type PortraitResearchBatchItem = typeof portraitResearchBatchItems.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// BLACK REPRESENTATION TRACKING
// ═══════════════════════════════════════════════════════════════════════════

export const cbcMembers = mysqlTable("cbc_members", {
  id: int("id").autoincrement().primaryKey(),
  // District is deliberately not unique: an incumbent, successor nominee, and
  // challenger can all be relevant to Black political representation in one race.
  district: varchar("district", { length: 128 }).notNull(),
  member: varchar("member", { length: 128 }).notNull(),
  party: mysqlEnum("party", ["D", "R", "I"]).notNull(),
  state: varchar("state", { length: 64 }).notNull(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  chamber: mysqlEnum("chamber", ["house", "senate", "governor"]).notNull(),
  status: mysqlEnum("cbc_status", [
    "running", "retiring", "resigned", "withdrawn", "deceased", "lost_primary",
    "running_for_governor", "running_for_senate",
    "not_up_2026", "challenger", "advanced_to_general", "in_runoff",
    "too_close_to_call", "elected", "won_general", "lost_general"
  ]).notNull().default("running"),
  roleType: mysqlEnum("role_type", [
    "incumbent", "nominee", "challenger", "former_member", "delegate"
  ]).notNull().default("incumbent"),
  isCurrentMember: boolean("is_current_member").default(true).notNull(),
  upIn2026: boolean("up_in_2026").default(true).notNull(),
  raceStage: mysqlEnum("race_stage", [
    "pre_primary", "primary", "runoff", "general", "special", "called", "not_up"
  ]).notNull().default("general"),
  primaryResult: varchar("primary_result", { length: 128 }),
  primaryVotes: bigint("primary_votes", { mode: "number" }),
  primaryVotePct: decimal("primary_vote_pct", { precision: 5, scale: 2 }),
  primaryOpponent: varchar("primary_opponent", { length: 128 }),
  primaryDate: varchar("primary_date", { length: 32 }),
  runoffVotes: bigint("runoff_votes", { mode: "number" }),
  runoffVotePct: decimal("runoff_vote_pct", { precision: 5, scale: 2 }),
  runoffOpponent: varchar("runoff_opponent", { length: 128 }),
  runoffDate: varchar("runoff_date", { length: 32 }),
  generalOpponent: varchar("general_opponent", { length: 128 }),
  sourceUrl: text("source_url"),
  sourceLabel: varchar("source_label", { length: 128 }),
  redistrictingContext: text("redistricting_context"),
  aipacFunding: text("aipac_funding"),
  raceSummary: text("race_summary"),
  riskLevel: mysqlEnum("risk_level", ["safe", "watch", "endangered"]),
  notes: text("notes"),
  photo: text("photo"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CbcMember = typeof cbcMembers.$inferSelect;
export type InsertCbcMember = typeof cbcMembers.$inferInsert;

/**
 * Race-level records sourced from Black Politics Now's ongoing Black
 * Representation tracker. This complements the candidate/member profile table
 * above and preserves both winner and runner-up results for each contest.
 */
export const blackRepresentationElections = mysqlTable("black_representation_elections", {
  id: int("id").autoincrement().primaryKey(),
  district: varchar("district", { length: 128 }).notNull(),
  state: varchar("state", { length: 64 }).notNull(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  chamber: mysqlEnum("chamber", ["house", "senate", "governor"]).notNull(),
  electionType: mysqlEnum("election_type", ["primary", "runoff", "general", "special"]).notNull(),
  partyContest: varchar("party_contest", { length: 16 }),
  electionDate: varchar("election_date", { length: 32 }),
  resultStatus: mysqlEnum("result_status", ["called", "too_close_to_call", "upcoming", "uncontested", "withdrawn"]).notNull().default("upcoming"),
  winnerName: varchar("winner_name", { length: 128 }),
  winnerParty: varchar("winner_party", { length: 8 }),
  winnerVotes: bigint("winner_votes", { mode: "number" }),
  winnerVotePct: decimal("winner_vote_pct", { precision: 5, scale: 2 }),
  runnerUpName: varchar("runner_up_name", { length: 128 }),
  runnerUpParty: varchar("runner_up_party", { length: 8 }),
  runnerUpVotes: bigint("runner_up_votes", { mode: "number" }),
  runnerUpVotePct: decimal("runner_up_vote_pct", { precision: 5, scale: 2 }),
  generalOpponent: varchar("general_opponent", { length: 128 }),
  sourceUrl: text("source_url"),
  sourceLabel: varchar("source_label", { length: 128 }),
  articleUrl: text("article_url"),
  redistrictingContext: text("redistricting_context"),
  notes: text("notes"),
  lastVerifiedAt: timestamp("last_verified_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type BlackRepresentationElection = typeof blackRepresentationElections.$inferSelect;
export type InsertBlackRepresentationElection = typeof blackRepresentationElections.$inferInsert;

/**
 * A durable audit record for deliberate one-at-a-time removals. The source rows
 * can be deleted only by an administrator, but the essential prior snapshot,
 * reason, and actor remain reviewable after a correction.
 */
export const candidateRemovalAudit = mysqlTable("candidate_removal_audit", {
  id: int("id").autoincrement().primaryKey(),
  targetType: mysqlEnum("target_type", ["black_representation_profile", "black_representation_contest"]).notNull(),
  targetId: int("target_id").notNull(),
  displayName: varchar("display_name", { length: 160 }).notNull(),
  stateCode: varchar("state_code", { length: 2 }),
  district: varchar("district", { length: 128 }),
  reason: text("reason").notNull(),
  sourceUrl: text("source_url"),
  removedBy: varchar("removed_by", { length: 128 }).notNull(),
  snapshotJson: text("snapshot_json").notNull(),
  removedAt: timestamp("removed_at").defaultNow().notNull(),
});

export type CandidateRemovalAudit = typeof candidateRemovalAudit.$inferSelect;

/**
 * Immutable source package retained when an administrator adds a Black
 * Representation profile or contest through the protected Admin workflow.
 */
export const blackRepresentationAdditionAudit = mysqlTable("black_representation_addition_audit", {
  id: int("id").autoincrement().primaryKey(),
  targetType: mysqlEnum("target_type", ["black_representation_profile", "black_representation_contest"]).notNull(),
  targetId: int("target_id").notNull(),
  displayName: varchar("display_name", { length: 160 }).notNull(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  district: varchar("district", { length: 128 }).notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceLabel: varchar("source_label", { length: 160 }).notNull(),
  addedBy: varchar("added_by", { length: 128 }).notNull(),
  additionNote: text("addition_note"),
  snapshotJson: text("snapshot_json").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => [
  index("black_rep_addition_target_idx").on(table.targetType, table.targetId, table.addedAt),
]);

export type BlackRepresentationAdditionAudit = typeof blackRepresentationAdditionAudit.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// HISTORICAL ATLAS OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A durable result for a guarded Atlas operations check. These records monitor
 * source-registry and playback contracts only; they never rewrite UCLA
 * geometry, Census apportionment, or Voteview roster data.
 */
export const atlasOperationsAudits = mysqlTable("atlas_operations_audits", {
  id: int("id").autoincrement().primaryKey(),
  auditType: mysqlEnum("audit_type", ["playback_contract"]).notNull(),
  status: mysqlEnum("status", ["passed", "warning", "failed"]).notNull(),
  summary: text("summary").notNull(),
  detailsJson: text("details_json").notNull(),
  initiatedBy: varchar("initiated_by", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("atlas_operations_audit_created_idx").on(table.createdAt),
  index("atlas_operations_audit_type_created_idx").on(table.auditType, table.createdAt),
]);

export type AtlasOperationsAudit = typeof atlasOperationsAudits.$inferSelect;

/**
 * Editor-controlled context attached to a single state and Congress. Only an
 * approved note can be displayed publicly; all source URLs and review fields
 * remain durable so editorial context never masquerades as source geometry.
 */
export const atlasEditorialNotes = mysqlTable("atlas_editorial_notes", {
  id: int("id").autoincrement().primaryKey(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  congress: int("congress").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  sourceLabel: varchar("source_label", { length: 160 }).notNull(),
  sourceUrl: text("source_url").notNull(),
  status: mysqlEnum("status", ["draft", "approved"]).default("draft").notNull(),
  createdBy: varchar("created_by", { length: 128 }).notNull(),
  approvedBy: varchar("approved_by", { length: 128 }),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("atlas_editorial_note_scope_idx").on(table.stateCode, table.congress, table.status),
  index("atlas_editorial_note_status_updated_idx").on(table.status, table.updatedAt),
]);

export type AtlasEditorialNote = typeof atlasEditorialNotes.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// AUTONOMOUS RESEARCH DESK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Singleton configuration for the reviewed, non-publishing research workflow.
 * The scheduled task UID is persisted so the job can be inspected, paused, or
 * changed without relying on an in-memory process.
 */
export const agentSettings = mysqlTable("agent_settings", {
  id: int("id").primaryKey(),
  enabled: boolean("enabled").default(true).notNull(),
  researchIntervalHours: int("research_interval_hours").default(4).notNull(),
  defaultEditorialOwner: varchar("default_editorial_owner", { length: 128 }).default("Editorial Desk"),
  defaultDataQualityOwner: varchar("default_data_quality_owner", { length: 128 }).default("Data Desk"),
  scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
  priorityModeEnabled: boolean("priority_mode_enabled").default(false).notNull(),
  priorityModeExpiresAt: timestamp("priority_mode_expires_at"),
  priorityScheduleCronTaskUid: varchar("priority_schedule_cron_task_uid", { length: 65 }),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AgentSettings = typeof agentSettings.$inferSelect;

/**
 * Auditable records of manual, administrative, and scheduled research runs.
 * Source snapshots are stored as JSON text so every recommendation can be
 * traced back to the platform context reviewed at that time.
 */
export const agentRuns = mysqlTable("agent_runs", {
  id: int("id").autoincrement().primaryKey(),
  trigger: mysqlEnum("trigger", ["manual", "admin", "scheduled"]).notNull(),
  mode: mysqlEnum("mode", ["routine", "election_night"]).notNull().default("routine"),
  status: mysqlEnum("status", ["running", "success", "failed", "skipped"]).notNull().default("running"),
  model: varchar("model", { length: 64 }).notNull(),
  sourceSnapshot: text("source_snapshot"),
  summary: text("summary"),
  recommendationCount: int("recommendation_count").default(0).notNull(),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type AgentRun = typeof agentRuns.$inferSelect;

/**
 * A durable morning record of the editorial automation state. The Daily Brief
 * guard writes this after each relevant outcome so Admin can diagnose what the
 * production system found that morning without relying on transient logs.
 */
export const dailyOperationalSnapshots = mysqlTable("daily_operational_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  snapshotDate: varchar("snapshotDate", { length: 10 }).notNull().unique(),
  briefStatus: varchar("briefStatus", { length: 32 }).notNull().default("held"),
  briefSegmentCount: int("briefSegmentCount").notNull().default(0),
  briefSourceReadyCount: int("briefSourceReadyCount").notNull().default(0),
  andrewFullReady: boolean("andrewFullReady").notNull().default(false),
  jennyFullReady: boolean("jennyFullReady").notNull().default(false),
  agentRunStatus: varchar("agentRunStatus", { length: 32 }),
  agentRunSummary: text("agentRunSummary"),
  pendingRecommendations: int("pendingRecommendations").notNull().default(0),
  openAgentTasks: int("openAgentTasks").notNull().default(0),
  readyAgentTasks: int("readyAgentTasks").notNull().default(0),
  portraitEvidenceNeeded: int("portraitEvidenceNeeded").notNull().default(0),
  pendingPortraitReviews: int("pendingPortraitReviews").notNull().default(0),
  summary: text("summary"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyOperationalSnapshot = typeof dailyOperationalSnapshots.$inferSelect;

/**
 * Recommendations are deliberately review-only. They have no link to an
 * election or publishing mutation, so an AI run cannot silently alter public
 * facts, send alerts, or publish newsroom content.
 */
export const agentRecommendations = mysqlTable("agent_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  runId: int("run_id").notNull(),
  category: mysqlEnum("category", ["data_quality", "editorial", "coverage_gap", "source_watch", "product"]).notNull(),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).notNull().default("medium"),
  title: varchar("title", { length: 256 }).notNull(),
  summary: text("summary").notNull(),
  proposedAction: text("proposed_action").notNull(),
  evidence: text("evidence").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "dismissed", "deferred"]).notNull().default("pending"),
  assignedTo: varchar("assigned_to", { length: 128 }),
  assignedBy: varchar("assigned_by", { length: 128 }),
  assignedAt: timestamp("assigned_at"),
  reviewedBy: varchar("reviewed_by", { length: 128 }),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AgentRecommendation = typeof agentRecommendations.$inferSelect;

/**
 * Human-approved work items created from an Agent Desk recommendation. The
 * agent cannot create these rows: an administrator must approve the underlying
 * recommendation first. Agent execution can produce only a reviewable, cited
 * work package; it has no publishing, alerting, or election-data mutation path.
 */
export const agentTasks = mysqlTable("agent_tasks", {
  id: int("id").autoincrement().primaryKey(),
  recommendationId: int("recommendation_id").notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  owner: varchar("owner", { length: 128 }),
  dueDate: timestamp("due_date"),
  status: mysqlEnum("status", ["open", "in_progress", "blocked", "ready_for_review", "completed"]).notNull().default("open"),
  executionMode: mysqlEnum("execution_mode", ["human", "agent"]).notNull().default("human"),
  executionScope: text("execution_scope"),
  sourceRequirements: text("source_requirements"),
  agentWorkPackage: text("agent_work_package"),
  agentWorkPackageSources: text("agent_work_package_sources"),
  executionStartedAt: timestamp("execution_started_at"),
  executionCompletedAt: timestamp("execution_completed_at"),
  executionError: text("execution_error"),
  createdBy: varchar("created_by", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type AgentTask = typeof agentTasks.$inferSelect;

/**
 * Structured proposals produced only after a human has approved a task for
 * agent execution. These records are review artifacts, not a mutation queue:
 * approving a proposal records the editorial decision but cannot publish,
 * alter election data, or write to WordPress.
 */
export const agentChangeProposals = mysqlTable("agent_change_proposals", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("task_id").notNull(),
  kind: mysqlEnum("kind", ["article_link", "data_correction", "editorial_copy", "portrait_source"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  targetType: varchar("target_type", { length: 80 }).notNull(),
  targetReference: text("target_reference").notNull(),
  beforeValue: text("before_value"),
  proposedValue: text("proposed_value").notNull(),
  rationale: text("rationale").notNull(),
  evidence: text("evidence").notNull(),
  status: mysqlEnum("status", ["pending_review", "approved", "rejected", "revision_requested"]).notNull().default("pending_review"),
  reviewerNotes: text("reviewer_notes"),
  reviewedBy: varchar("reviewed_by", { length: 128 }),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AgentChangeProposal = typeof agentChangeProposals.$inferSelect;
