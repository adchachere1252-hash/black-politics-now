import type { Express, Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { runCookIslandsVerifiedWatch } from "./worldElectionWatch";

export function registerWorldWatchScheduleRoute(app: Express) {
  app.post("/api/scheduled/world-election-watch", async (req: Request, res: Response) => {
    let user: Awaited<ReturnType<typeof sdk.authenticateRequest>>;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      return res.status(403).json({ error: "cron-only" });
    }
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    try {
      return res.json(await runCookIslandsVerifiedWatch(user.taskUid));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown World Elections watch failure";
      console.error("[World Elections watch]", error);
      return res.status(500).json({ error: message, timestamp: new Date().toISOString(), context: { path: "/api/scheduled/world-election-watch" } });
    }
  });
}
