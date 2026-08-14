import { getAgentChangeProposals, getAgentTasks, runElectionDayCommandResearch } from "../server/agentDesk";

async function main() {
  const task = await runElectionDayCommandResearch(0, "A.D. Chachere");
  const [storedTask] = (await getAgentTasks()).filter((item) => item.id === task.id);
  const proposals = (await getAgentChangeProposals()).filter((proposal) => proposal.taskId === task.id);
  console.log(JSON.stringify({
    taskId: task.id,
    status: storedTask?.status ?? task.status,
    proposalCount: proposals.length,
    proposalKinds: proposals.map((proposal) => proposal.kind),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
