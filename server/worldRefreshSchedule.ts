import type { Express, Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { runDatedWorldElectionRefresh } from "./worldElectionRefresh";

export function registerWorldRefreshScheduleRoute(app: Express) {
  app.post("/api/scheduled/world-elections-refresh", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      const result = await runDatedWorldElectionRefresh(user.taskUid);
      return res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown World Elections refresh error";
      return res.status(500).json({ error: message, context: { url: req.originalUrl }, timestamp: new Date().toISOString() });
    }
  });
}
