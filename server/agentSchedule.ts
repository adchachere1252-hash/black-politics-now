import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { agentSettings } from "../drizzle/schema";
import { getDb } from "./db";
import { runResearchDesk } from "./agentDesk";
import { sdk } from "./_core/sdk";

/**
 * Receives only platform-authenticated heartbeat traffic. The handler is
 * deliberately recommendation-only: runResearchDesk cannot publish, alert, or
 * mutate an election record.
 */
export function registerAgentScheduleRoute(app: Express) {
  app.post("/api/scheduled/research-desk", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: "cron-only" });
      }

      const db = await getDb();
      if (!db) return res.status(503).json({ error: "database-unavailable" });
      const [settings] = await db.select().from(agentSettings)
        .where(eq(agentSettings.scheduleCronTaskUid, user.taskUid)).limit(1);

      // A deleted or replaced task may retry after its owning row changes.
      if (!settings) return res.json({ ok: true, skipped: "orphan" });
      if (!settings.enabled) return res.json({ ok: true, skipped: "disabled" });

      const result = await runResearchDesk("scheduled");
      return res.json({ ok: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Research Desk schedule failure";
      console.error("[Research Desk schedule]", error);
      return res.status(500).json({
        error: message,
        timestamp: new Date().toISOString(),
        context: { path: "/api/scheduled/research-desk" },
      });
    }
  });
}
