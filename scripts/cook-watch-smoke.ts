import { runCookIslandsVerifiedWatch } from "../server/worldElectionWatch";

const taskUid = process.env.COOK_WATCH_TASK_UID;
if (!taskUid) throw new Error("COOK_WATCH_TASK_UID is required");

const result = await runCookIslandsVerifiedWatch(taskUid);
console.log(JSON.stringify(result));
