import { MongoDoc } from "@/Components/Hooks/useUser";
import { ta } from "@/Components/Admin/i18n/adminText";

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
  "/",
  "/book",
  "/about",
  "/contact",
  "/policy",
  "/privacy",
  "/map",
  "/become/doctor",
  "/become/clinic",
  "/become/hospital",
  "/become/insurance",
  "/become/paraClinic",
  "/become/pharmacy",
] as const;

// every single-document page in the app, e.g. /symptom/[slug]
export const pageMetaNodeResourceTypes = [
  "/mag/[blogSlug]",
  "/dr/[slug]",
  "/disease/[slug]",
  "/drug/[slug]",
  "/speciality/[slug]",
  "/clinic/[slug]",
  "/hospital/[slug]",
  "/paraClinic/[slug]",
  "/pharmacy/[slug]",
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
  get "/mag"() {
  return ta("مقالات");
},
  get "/doctors"() {
  return ta("پزشکان");
},
  get "/disease"() {
  return ta("بیماری ها");
},
  get "/drug"() {
  return ta("دارو ها");
},
  get "/speciality"() {
  return ta("تخصص ها");
},
  get "/clinic"() {
  return ta("کلینیک ها");
},
  get "/hospital"() {
  return ta("بیمارستان ها");
},
  get "/paraClinic"() {
  return ta("پاراکلینیک");
},
  get "/test"() {
  return ta("تست ها");
},
  get "/service"() {
  return ta("خدمات");
},
  get "/product"() {
  return ta("محصولات");
},
  get "/symptom"() {
  return ta("علائم");
},
  get "/insurance"() {
  return ta("بیمه");
},
  get "/faq"() {
  return ta("سوالات متداول");
},
  get "/"() {
  return ta("صفحه اصلی");
},
  get "/book"() {
  return ta("نوبت دهی");
},
  get "/about"() {
  return ta("درباره ما");
},
  get "/contact"() {
  return ta("تماس با ما");
},
  get "/policy"() {
  return ta("قوانین و مقررات");
},
  get "/privacy"() {
  return ta("حریم خصوصی");
},
  get "/map"() {
  return ta("نقشه");
},
  get "/become/doctor"() {
  return ta("ثبت نام پزشک");
},
  get "/become/clinic"() {
  return ta("ثبت نام کلینیک");
},
  get "/become/hospital"() {
  return ta("ثبت نام بیمارستان");
},
  get "/become/insurance"() {
  return ta("ثبت نام بیمه");
},
  get "/become/paraClinic"() {
  return ta("ثبت نام پاراکلینیک");
},
  get "/become/pharmacy"() {
  return ta("ثبت نام داروخانه");
},
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
