export const getPublicData = async <T,>(
  path: string
): Promise<T | undefined> => {
  const response = await fetch(`http://127.0.01/api/v1/public/${path}`, {
    cache: "no-store",
  });
  if (!response.ok) return;
  try {
    const data = await response.json();
    return data?.data as T;
  } catch {
    return;
  }
};
