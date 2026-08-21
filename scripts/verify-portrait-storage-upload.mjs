import { uploadPortraitImage } from "../server/portraitReview.ts";

const transparentPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL3pAAAAABJRU5ErkJggg==";

const uploaded = await uploadPortraitImage({
  fileName: "portrait-storage-verification.png",
  contentType: "image/png",
  dataBase64: transparentPngBase64,
}, "verification-admin");

if (!uploaded.url.startsWith("/manus-storage/candidate-portraits/")) {
  throw new Error(`Unexpected portrait storage URL: ${uploaded.url}`);
}

console.log(JSON.stringify({
  status: "passed",
  storageUrl: uploaded.url,
  message: "Stored a non-public 1×1 upload verification artifact only; no candidate, review, or public portrait record was changed.",
}, null, 2));
