export type OfficialSourceLeadTarget = {
  candidateName: string;
  location?: string;
  targetType: "senate" | "house" | "governor" | "black_representation";
};

export type OfficialSourceLead = {
  label: string;
  detail: string;
  url: string;
};

function searchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * These are discovery leads, not proof. They deliberately point reviewers to
 * official campaign, legislative, and state-government sources before a photo
 * can be submitted for human approval.
 */
export function getOfficialPortraitSourceLeads(target: OfficialSourceLeadTarget): OfficialSourceLead[] {
  const identity = [target.candidateName, target.location].filter(Boolean).join(" ");
  const federal = target.targetType === "senate" || target.targetType === "house" || target.targetType === "black_representation";
  const leads: OfficialSourceLead[] = [
    {
      label: "Official campaign portrait",
      detail: "Find the candidate’s official campaign biography or media page.",
      url: searchUrl(`${identity} official campaign portrait`),
    },
    {
      label: "State election authority",
      detail: "Use the relevant Secretary of State or election office to confirm the candidate identity and race.",
      url: searchUrl(`${identity} Secretary of State candidate`),
    },
  ];
  if (federal) {
    leads.splice(1, 0, {
      label: "Congressional biography",
      detail: "Check the official Bioguide record when the candidate is a current or former Member of Congress.",
      url: searchUrl(`${target.candidateName} site:bioguide.congress.gov`),
    });
  } else {
    leads.splice(1, 0, {
      label: "Official government biography",
      detail: "Check the candidate’s official state-government biography when available.",
      url: searchUrl(`${identity} official government biography`),
    });
  }
  return leads;
}
