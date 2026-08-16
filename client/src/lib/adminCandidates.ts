export type AdminCandidateCategory = "senate" | "house" | "governor" | "black_representation";
export type AdminCandidatePhotoStatus = "ready" | "pending_review" | "evidence_needed";
type PortraitPhotoField = "candidate1" | "candidate2" | "dem" | "rep" | "profile";

export type AdminCandidateRow = {
  id: string;
  category: AdminCandidateCategory;
  candidateName: string;
  party: string;
  location: string;
  photoUrl: string;
  photoStatus: AdminCandidatePhotoStatus;
  portraitTarget: PortraitTarget;
};

type PortraitTarget = {
  targetType: AdminCandidateCategory;
  targetRecordId: number;
  targetPhotoField: PortraitPhotoField;
};

type PortraitSubmission = {
  targetType: AdminCandidateCategory;
  targetRecordId: number;
  targetPhotoField: string;
  status: string;
};

function targetKey(targetType: string, targetRecordId: number, targetPhotoField: string) {
  return `${targetType}:${targetRecordId}:${targetPhotoField}`;
}

function photoStatusFor(
  category: AdminCandidateCategory,
  recordId: number,
  photoField: string,
  missingTargets: PortraitTarget[],
  pendingSubmissions: PortraitSubmission[],
): AdminCandidatePhotoStatus {
  const key = targetKey(category, recordId, photoField);
  if (pendingSubmissions.some((submission) => submission.status === "pending" && targetKey(submission.targetType, submission.targetRecordId, submission.targetPhotoField) === key)) return "pending_review";
  if (missingTargets.some((target) => targetKey(target.targetType, target.targetRecordId, target.targetPhotoField) === key)) return "evidence_needed";
  return "ready";
}

export function buildAdminCandidateRows(input: {
  senate: any[];
  house: any[];
  governors: any[];
  blackRepresentation: any[];
  missingTargets: PortraitTarget[];
  portraitSubmissions: PortraitSubmission[];
}): AdminCandidateRow[] {
  const rows: AdminCandidateRow[] = [];
  const { senate, house, governors, blackRepresentation, missingTargets, portraitSubmissions } = input;
  const add = (row: Omit<AdminCandidateRow, "photoStatus" | "portraitTarget">, photoField: PortraitPhotoField, recordId: number) => {
    if (!row.candidateName?.trim()) return;
    const portraitTarget: PortraitTarget = { targetType: row.category, targetRecordId: recordId, targetPhotoField: photoField };
    rows.push({ ...row, portraitTarget, photoStatus: photoStatusFor(row.category, recordId, photoField, missingTargets, portraitSubmissions) });
  };

  senate.forEach((race) => {
    add({ id: `senate:${race.id}:candidate1`, category: "senate", candidateName: race.candidate1Name, party: race.candidate1Party ?? "", location: `${race.stateName} Senate`, photoUrl: race.candidate1Photo ?? "" }, "candidate1", race.id);
    add({ id: `senate:${race.id}:candidate2`, category: "senate", candidateName: race.candidate2Name, party: race.candidate2Party ?? "", location: `${race.stateName} Senate`, photoUrl: race.candidate2Photo ?? "" }, "candidate2", race.id);
  });
  house.forEach((race) => {
    add({ id: `house:${race.id}:candidate1`, category: "house", candidateName: race.candidate1Name, party: race.candidate1Party ?? "", location: `${race.stateName} ${race.districtLabel}`, photoUrl: race.candidate1Photo ?? "" }, "candidate1", race.id);
    add({ id: `house:${race.id}:candidate2`, category: "house", candidateName: race.candidate2Name, party: race.candidate2Party ?? "", location: `${race.stateName} ${race.districtLabel}`, photoUrl: race.candidate2Photo ?? "" }, "candidate2", race.id);
  });
  governors.forEach((race) => {
    add({ id: `governor:${race.id}:dem`, category: "governor", candidateName: race.demCandidate, party: "D", location: `${race.stateName} Governor`, photoUrl: race.demPhoto ?? "" }, "dem", race.id);
    add({ id: `governor:${race.id}:rep`, category: "governor", candidateName: race.repCandidate, party: "R", location: `${race.stateName} Governor`, photoUrl: race.repPhoto ?? "" }, "rep", race.id);
  });
  blackRepresentation.forEach((profile) => {
    add({ id: `black_representation:${profile.id}:profile`, category: "black_representation", candidateName: profile.member, party: profile.party ?? "", location: `${profile.state} ${profile.district}`, photoUrl: profile.photo ?? "" }, "profile", profile.id);
  });

  return rows.sort((left, right) => left.candidateName.localeCompare(right.candidateName));
}
