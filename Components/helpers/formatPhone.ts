// 98912... (how the API stores a mobile) as an Iranian reads it: 0912...
export const formatPhone = (phone?: string) => {
  const p = String(phone || "").trim();
  return /^98\d{10}$/.test(p) ? `0${p.slice(2)}` : p;
};
