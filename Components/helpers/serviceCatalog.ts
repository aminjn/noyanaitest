// A doctor's services are catalogue references (ServiceCategory, 2026-10):
// the ids a form's picker starts from, whether the profile came back with
// ids or populated entries. An old free-text string or a null is skipped.
export const serviceCategoryIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  const ids = value
    .map((el) =>
      el && typeof el === "object" ? (el as { _id?: unknown })._id : el,
    )
    .filter((id): id is string => typeof id === "string" && /^[a-f\d]{24}$/i.test(id));
  return ids.filter((id, i) => ids.indexOf(id) === i);
};
