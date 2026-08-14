import { getPortraitSubmissionTargets } from "../server/portraitReview";
import { runPortraitResearchTask } from "../server/agentDesk";

async function main() {
  const targets = await getPortraitSubmissionTargets();
  const target = targets[0];
  if (!target) throw new Error("No remaining portrait gaps are available for research");

  console.log(JSON.stringify({ selectedTarget: target }, null, 2));
  const result = await runPortraitResearchTask(target, "A.D. Chachere");
  console.log(JSON.stringify({ taskId: result.task?.id, proposalCount: result.proposals?.length ?? 0, status: result.task?.status }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
