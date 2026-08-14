import { approveRecommendationToTask, executeAgentTask } from "../server/agentDesk";

async function main() {
  const task = await approveRecommendationToTask(
    330001,
    "Data Desk",
    "2026-08-15",
    "A.D. Chachere",
    "agent",
    "Produce a source-grounded verification matrix for the platform's Alabama Senate, House, Governor, and Black Representation records. Identify apparent duplicate or conflicting records, distinguish confirmed facts from gaps, and recommend only editor-review actions. Do not alter records or prepare public publication.",
    "Use the platform's current election and Black Representation records plus the cited source context available to the Research Desk. For every claim, distinguish platform evidence from missing or independently corroborated evidence. Include source links and a concise reviewer checklist.",
  );
  console.log(JSON.stringify({ stage: "approved", taskId: task.id, executionMode: task.executionMode, status: task.status }));
  const completed = await executeAgentTask(task.id, "A.D. Chachere");
  console.log(JSON.stringify({
    stage: "ready_for_review",
    taskId: completed.id,
    status: completed.status,
    hasWorkPackage: Boolean(completed.agentWorkPackage),
    citedSources: completed.agentWorkPackageSources ? JSON.parse(completed.agentWorkPackageSources).length : 0,
  }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
