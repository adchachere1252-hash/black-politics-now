import { readFileSync } from "node:fs";
import path from "node:path";

type PhotoMap = Record<string, unknown>;

const photoMap: PhotoMap = JSON.parse(
  readFileSync(path.join(process.cwd(), "server", "repositoryCandidatePhotos.json"), "utf8")
) as PhotoMap;
const researchedPhotoMap: PhotoMap = JSON.parse(
  readFileSync(path.join(process.cwd(), "server", "researchedCandidatePhotos.json"), "utf8")
) as PhotoMap;
const blackRepresentationPhotoMap: PhotoMap = JSON.parse(
  readFileSync(path.join(process.cwd(), "server", "blackRepresentationVerifiedPhotos.json"), "utf8")
) as PhotoMap;

const BIOGUIDE_BASE = "https://unitedstates.github.io/images/congress/225x275";
const REPOSITORY_STORAGE_BASE = "https://electionmap-duqshn4d.manus.space";

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/,?\s+(jr\.?|sr\.?|ii|iii|iv)$/i, "")
    .replace(/\s+[a-z]\.?\s+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasUsableStoredPhoto(url: string | null | undefined): url is string {
  return Boolean(url && url.trim() && url !== "None" && url !== "null");
}

function getStringToken(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

/**
 * Resolves only repository-verified photo tokens. The returned URL is a display
 * fallback; it never overwrites an editor-managed database photo field.
 */
export function resolveRepositoryCandidatePhoto(name: string | null | undefined): string | null {
  if (!name || name.trim().toLowerCase().startsWith("tbd")) return null;
  const exact = name.toLowerCase().trim();
  const researched = getStringToken(blackRepresentationPhotoMap[exact]) ?? getStringToken(blackRepresentationPhotoMap[normalizeName(name)]) ?? getStringToken(researchedPhotoMap[exact]) ?? getStringToken(researchedPhotoMap[normalizeName(name)]);
  if (researched) return researched;
  const token = getStringToken(photoMap[exact]) ?? getStringToken(photoMap[normalizeName(name)]);
  if (!token) return null;
  if (token.startsWith("bioguide:")) return `${BIOGUIDE_BASE}/${token.slice("bioguide:".length)}.jpg`;
  if (token.startsWith("manus:")) {
    const storedPath = token.slice("manus:".length);
    if (storedPath.startsWith("http")) return storedPath;
    if (storedPath.startsWith("/manus-storage/")) return `${REPOSITORY_STORAGE_BASE}${storedPath}`;
    return `${REPOSITORY_STORAGE_BASE}/manus-storage/${storedPath.replace(/^\/+/, "")}`;
  }
  if (token.startsWith("cdn:")) return `${REPOSITORY_STORAGE_BASE}/manus-storage/${token.slice("cdn:".length)}`;
  return null;
}

export function photoWithRepositoryFallback(name: string | null | undefined, storedPhoto: string | null | undefined): string | null {
  return hasUsableStoredPhoto(storedPhoto) ? storedPhoto : resolveRepositoryCandidatePhoto(name);
}

export const candidatePhotoMapEntryCount = Object.keys(photoMap).length;
