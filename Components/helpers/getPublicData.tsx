import { BACKEND } from "../config";

export const getPublicData = async <T,>(
  path: string,
  searchParams?: Record<string, string>,
): Promise<T | undefined> => {
  const qs =
    searchParams && Object.keys(searchParams).length
      ? `?${new URLSearchParams(searchParams).toString()}`
      : "";
  const response = await fetch(`${BACKEND}/api/v1/public/${path}${qs}`, {
    cache: "no-store",
  });
  if (!response.ok) return;
  try {
    const data = await response.json();
    // if (path.includes("doctor")) console.log(data);
    return data?.data as T;
  } catch {
    return;
  }
};
