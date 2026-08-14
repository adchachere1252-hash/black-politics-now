import { runDatedWorldElectionRefresh } from "../server/worldElectionRefresh";

async function main() {
  const result = await runDatedWorldElectionRefresh();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
