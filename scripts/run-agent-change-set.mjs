import { executeAgentTaskWithChangeSet } from "../server/agentDesk.ts";

const taskId = Number(process.argv[2] || "120001");
if (!Number.isInteger(taskId) || taskId < 1) throw new Error("Pass a positive Agent Desk task ID");

const task = await executeAgentTaskWithChangeSet(taskId, "Administrator");
console.log(JSON.stringify({
  taskId: task.id,
  status: task.status,
  completedAt: task.executionCompletedAt,
}, null, 2));
