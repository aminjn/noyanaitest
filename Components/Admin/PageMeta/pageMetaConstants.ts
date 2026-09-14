import { MongoDoc } from "@/Components/Hooks/useUser";

// every listing page in the app, e.g. /symptom
export const pageMetaListResourceTypes = [
  "/mag",
  "/doctors",
  "/disease",
  "/drug",
  "/speciality",
  "/clinic",
  "/hospital",
  "/paraClinic",
  "/test",
  "/service",
  "/product",
  "/symptom",
  "/insurance",
  "/faq",
] as const;

// every single-document page in the app, e.g. /symptom/[slug]
export const pageMetaNodeResourceTypes = [
  "/mag/[blogSlug]",
  "/doctor/[slug]",
  "/disease/[slug]",
  "/drug/[slug]",
  "/speciality/[slug]",
  "/clinic/[slug]",
  "/hospital/[slug]",
  "/paraClinic/[slug]",
  "/product/[slug]",
  "/productPackage/[slug]",
  "/symptom/[slug]",
  "/service/[slug]",
  "/servicePackage/[slug]",
  "/insurance/[slug]",
] as const;

export type PageMetaListResourceType =
  (typeof pageMetaListResourceTypes)[number];
export type PageMetaNodeResourceType =
  (typeof pageMetaNodeResourceTypes)[number];
export type PageMetaResourceType =
  | PageMetaListResourceType
  | PageMetaNodeResourceType;

export const pageMetaListResourceTypeLabels: Record<
  PageMetaListResourceType,
  string
> = {
  "/mag": "مقالات",
  "/doctors": "پزشکان",
  "/disease": "بیماری ها",
  "/drug": "دارو ها",
  "/speciality": "تخصص ها",
  "/clinic": "کلینیک ها",
  "/hospital": "بیمارستان ها",
  "/paraClinic": "پاراکلینیک",
  "/test": "تست ها",
  "/service": "خدمات",
  "/product": "محصولات",
  "/symptom": "علائم",
  "/insurance": "بیمه",
  "/faq": "سوالات متداول",
};

export interface IPageMeta extends MongoDoc {
  resourceType: PageMetaResourceType;
  slug?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  webSchema?: Record<string, unknown>;
  noIndex?: boolean;
  noFollow?: boolean;
}
