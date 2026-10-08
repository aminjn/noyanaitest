import { ContentKey } from "../Enums/contentKeys";

// Quick tags of a seller review (2026-10, mirrors backend Models/Comment.ts
// reviewTagsByPath): a pharmacy or a lab buyer ticks what went well next to
// the stars; the public page sums them up. The server sends which tags a
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
};

// only tags this build can name (an unknown one from a newer server is skipped)
export const knownReviewTags = (tags: unknown): string[] =>
  Array.isArray(tags)
    ? tags.filter((t): t is string => typeof t === "string" && t in reviewTagContentKey)
    : [];
