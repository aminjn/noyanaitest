import { ta } from "@/Components/Admin/i18n/adminText";

// quick tags of a seller review (backend Models/Comment.ts reviewTagsByPath)
export const reviewTagLabel: Record<string, () => string> = {
  deliverySpeed: () => ta("ارسال سریع"),
  packaging: () => ta("بسته‌بندی مناسب"),
  correctItems: () => ta("اقلام درست و کامل"),
  staffAdvice: () => ta("راهنمایی خوب داروساز"),
  sampling: () => ta("نمونه‌گیری خوب"),
  punctuality: () => ta("وقت‌شناسی"),
  resultSpeed: () => ta("جواب سریع"),
  clarity: () => ta("جواب واضح و قابل فهم"),
  // what went wrong (score 1-2): private, seen only here and by the seller
  lateDelivery: () => ta("ارسال دیرهنگام"),
  damagedPackaging: () => ta("بسته‌بندی آسیب‌دیده"),
  wrongItems: () => ta("اقلام اشتباه یا ناقص"),
  unhelpfulStaff: () => ta("برخورد یا راهنمایی نامناسب کارکنان"),
  samplingProblem: () => ta("مشکل در نمونه‌گیری"),
  keptWaiting: () => ta("معطلی و انتظار طولانی"),
  resultLate: () => ta("جواب دیرهنگام"),
  resultUnclear: () => ta("جواب نامفهوم"),
};
export const tagsLabel = (tags: unknown) =>
  (Array.isArray(tags) ? tags : [])
    .map((t) => reviewTagLabel[String(t)]?.())
    .filter(Boolean)
    .join(" · ") || "—";
