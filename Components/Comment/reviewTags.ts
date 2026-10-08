import { ContentKey } from "../Enums/contentKeys";

// Quick tags of a seller review (2026-10, mirrors backend Models/Comment.ts
// reviewTagsByPath): a pharmacy or a lab buyer ticks what went well next to
// the stars (what went wrong at 1-2 stars, seen only by the seller and the
// admin); the public page sums up the positive ones. The server sends which tags a
// page offers (tagOptions); this only names them.
export const reviewTagContentKey: Record<string, ContentKey> = {
  deliverySpeed: "reviewTagDeliverySpeed",
  packaging: "reviewTagPackaging",
  correctItems: "reviewTagCorrectItems",
  staffAdvice: "reviewTagStaffAdvice",
  sampling: "reviewTagSampling",
  punctuality: "reviewTagPunctuality",
  resultSpeed: "reviewTagResultSpeed",
  clarity: "reviewTagClarity",
  // what went wrong, offered at a low score (private to the seller / admin)
  lateDelivery: "reviewTagLateDelivery",
  damagedPackaging: "reviewTagDamagedPackaging",
  wrongItems: "reviewTagWrongItems",
  unhelpfulStaff: "reviewTagUnhelpfulStaff",
  samplingProblem: "reviewTagSamplingProblem",
  keptWaiting: "reviewTagKeptWaiting",
  resultLate: "reviewTagResultLate",
  resultUnclear: "reviewTagResultUnclear",
};

// backend Models/Comment.ts negativeReviewTagsByPath / NEGATIVE_TAG_MAX_SCORE:
// a score up to this offers the negative tags instead of the positive ones
export const NEGATIVE_TAG_MAX_SCORE = 2;
export const negativeReviewTags = new Set([
  "lateDelivery",
  "damagedPackaging",
  "wrongItems",
  "unhelpfulStaff",
  "samplingProblem",
  "keptWaiting",
  "resultLate",
  "resultUnclear",
]);

// only tags this build can name (an unknown one from a newer server is skipped)
export const knownReviewTags = (tags: unknown): string[] =>
  Array.isArray(tags)
    ? tags.filter((t): t is string => typeof t === "string" && t in reviewTagContentKey)
    : [];
