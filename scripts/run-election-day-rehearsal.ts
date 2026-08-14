import { advanceElectionDayRehearsal, startElectionDayRehearsal } from "../server/electionDayCommandCenter";

async function main() {
  const rehearsal = await startElectionDayRehearsal("A.D. Chachere");
  let current = rehearsal;
  for (const step of ["heartbeat", "triage", "research", "review"] as const) {
    current = await advanceElectionDayRehearsal(
      current.id,
      step,
      "User-approved private Election Day rehearsal. No public election, alert, or publishing action was invoked."
    );
  }
  console.log(JSON.stringify({
    id: current.id,
    status: current.status,
    progress: current.progress,
    startedBy: current.startedBy,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
