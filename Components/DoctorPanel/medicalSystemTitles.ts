import { ContentKey } from "../Enums/contentKeys";

// The medical council fields a provider registers under (stored in Persian,
// shown through these keys in every language).
export const medicalSystemTitles = [
  "دندانپزشکی",
  "پزشکی",
  "مامایی",
  "داروسازی",
  "تغذیه",
  "فیزیوتراپی",
  "آزمایشگاهی (بالینی)",
  "گفتار درمانی",
  "کاردرمانی",
  "بینایی سنجی",
  "شنوایی سنجی",
  "علوم آزمایشگاهی",
  "ارتز و پروتز",
  "اتباع خارجی",
  "کایروپراکتیک",
  "ناتروپاتی",
] as const;

export type MedicalSystemTitle = (typeof medicalSystemTitles)[number];

export const medicalSystemTitleKeys: Record<MedicalSystemTitle, ContentKey> = {
  دندانپزشکی: "mstDentistry",
  پزشکی: "mstMedicine",
  مامایی: "mstMidwifery",
  داروسازی: "mstPharmacy",
  تغذیه: "mstNutrition",
  فیزیوتراپی: "mstPhysiotherapy",
  "آزمایشگاهی (بالینی)": "mstClinicalLab",
  "گفتار درمانی": "mstSpeechTherapy",
  کاردرمانی: "mstOccupationalTherapy",
  "بینایی سنجی": "mstOptometry",
  "شنوایی سنجی": "mstAudiology",
  "علوم آزمایشگاهی": "mstLabSciences",
  "ارتز و پروتز": "mstOrthotics",
  "اتباع خارجی": "mstForeignNationals",
  کایروپراکتیک: "mstChiropractic",
  ناتروپاتی: "mstNaturopathy",
};
