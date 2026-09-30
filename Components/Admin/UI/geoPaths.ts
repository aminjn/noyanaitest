import { API } from "@/Components/config";

// Dependent address selects in the admin forms: the city list follows the
// chosen province and the district list the chosen city (the backend's
// /auto/city and /auto/district filter by ?province= / ?city=). With nothing
// chosen yet, the whole list loads, as before. A stored value may be an id
// or a populated record.
const refId = (value: unknown): string | undefined => {
  if (typeof value === "string") return value || undefined;
  if (value && typeof value === "object" && "_id" in value) {
    const id = (value as { _id?: unknown })._id;
    return typeof id === "string" && id ? id : undefined;
  }
  return undefined;
};

export const cityPath = (values: { province?: unknown }) => {
  const id = refId(values.province);
  return id
    ? `${API}/auto/city?province=${encodeURIComponent(id)}`
    : `${API}/auto/city`;
};

export const districtPath = (values: { city?: unknown }) => {
  const id = refId(values.city);
  return id
    ? `${API}/auto/district?city=${encodeURIComponent(id)}`
    : `${API}/auto/district`;
};
