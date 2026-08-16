export type PortraitEvidenceSource = { title?: string; url?: string; excerpt?: string };
export type PortraitSourceProposal = { title?: string; proposedValue?: string; evidence?: string | null };

export type PortraitApprovalEvidence = {
  imageUrl: string;
  sourceUrl: string;
  sourceTitle: string;
  proposalTitle: string;
};

function parseSources(value: string | null | undefined): PortraitEvidenceSource[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function urlsFromText(value: string | null | undefined) {
  return Array.from(String(value || "").matchAll(/https:\/\/[^\s)\]"']+/g)).map((match) => match[0]);
}

function isImageUrl(url: string) {
  return /\.(?:avif|gif|jpe?g|png|webp)(?:[?#].*)?$/i.test(url) || /\/photo\//i.test(url) || /\/images?\//i.test(url);
}

export function getPortraitApprovalEvidence(proposals: PortraitSourceProposal[], taskSources: PortraitEvidenceSource[] = []): PortraitApprovalEvidence | null {
  for (const proposal of proposals) {
    const proposalSources = parseSources(proposal.evidence);
    const sources = proposalSources.length ? proposalSources : taskSources;
    const urls = [...urlsFromText(proposal.proposedValue), ...sources.map((source) => source.url).filter((url): url is string => Boolean(url))];
    const imageUrl = urls.find(isImageUrl);
    const source = sources.find((item) => item.url && item.url !== imageUrl) ?? sources.find((item) => item.url);
    if (imageUrl && source?.url) {
      return {
        imageUrl,
        sourceUrl: source.url,
        sourceTitle: source.title || "Cited source",
        proposalTitle: proposal.title || "Portrait source proposal",
      };
    }
  }
  return null;
}
