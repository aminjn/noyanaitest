import { ReactNode } from "react";
import { ContentKey } from "../Enums/contentKeys";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import VirusIcon from "../Icons/VirusIcon";
import TemperatureIcon from "../Icons/TemperatureIcon";
import BuildingIcon from "../Icons/BuildingIcon";
import FlaskIcon from "../Icons/FlaskIcon";
import HospitalIcon from "../Icons/HospitalIcon";
import MedicalReportIcon from "../Icons/MedicalReportIcon";
import PillIcon from "../Icons/PillIcon";
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";
import MedicalRecordIcon from "../Icons/MedicalRecordIcon";
import BookOpenIcon from "../Icons/BookOpenIcon";
import { IBlogCategory } from "../Admin/Blog/AdminManageBlogsPage";
import { IProductCategory } from "../Admin/ProductCategory/AdminManageProductCategoriesPage";
import { IDiseaseCategory } from "../Admin/DiseaseCategory/AdminManageDiseaseCategoriesPage";
import { IClinicCategory } from "../Admin/ClinicCategory/AdminManageClinicCategoriesPage";
import { IParaClinicCategory } from "../Admin/ParaClinicCategory/AdminManageParaClinicCategoriesPage";
import { IHospitalCategory } from "../Admin/HospitalCategory/AdminManageHospitalCategoriesPage";
import { ITestCategory } from "../Admin/TestCategory/AdminManageTestCategoriesPage";
import { IServiceCategory } from "../Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import { ISymptomCategory } from "../Admin/SymptomCategory/AdminManageSymptomCategoriesPage";
import { IInsuranceCategory } from "../Admin/InsuranceCategory/AdminManageInsuranceCategoriesPage";

export interface HeaderCategories {
  blogCategories: IBlogCategory[];
  productCategories: IProductCategory[];
  diseaseCategories: IDiseaseCategory[];
  clinicCategories: IClinicCategory[];
  paraClinicCategories: IParaClinicCategory[];
  hospitalCategories: IHospitalCategory[];
  testCategories: ITestCategory[];
  serviceCategories: IServiceCategory[];
  // the specialities themselves: each entry opens its doctors
  specialities: CategoryLike[];
  symptomCategories: ISymptomCategory[];
  insuranceCategories: IInsuranceCategory[];
}

export type CategoryLike = {
  _id: string;
  slug?: string;
  name?: string;
  title?: string;
  // a section without categories in use lists its items instead (backend
  // getHeader): the entry opens the item's own page
  isItem?: boolean;
};

// soft colour pair for an icon tile (see the --tone* tokens in globals.css)
export type Tone = "indigo" | "violet" | "teal" | "amber" | "rose" | "sky";

export type CategoryTab = {
  key: keyof HeaderCategories;
  label: ContentKey;
  // one line under the title in the mega menu
  description: ContentKey;
  icon: ReactNode;
  tone: Tone;
  allTarget: string;
  hrefFor: (value: string) => string;
  // an item's own page (a section listing its items, not its categories)
  itemHref?: (value: string) => string;
};

// the entry's link: the item's page or the category's list
export const entryHref = (tab: CategoryTab, entry: CategoryLike) => {
  const value = entry.slug || entry._id;
  return entry.isItem && tab.itemHref ? tab.itemHref(value) : tab.hrefFor(value);
};

// The header's mega menu and the mobile drawer read the same list.
export const categoryTabs: CategoryTab[] = [
  {
    key: "specialities",
    description: "megaDescSpecialities",
    icon: <StetoscopeIcon />,
    tone: "indigo",
    label: "specialities",
    allTarget: "/speciality",
    hrefFor: (v) => `/speciality/${encodeURIComponent(v)}`,
  },
  {
    key: "diseaseCategories",
    description: "megaDescDiseases",
    icon: <VirusIcon />,
    tone: "rose",
    label: "diseases",
    allTarget: "/disease",
    itemHref: (v) => `/disease/${encodeURIComponent(v)}`,
    hrefFor: (v) => `/disease?category=${v}`,
  },
  {
    key: "symptomCategories",
    description: "megaDescSymptoms",
    icon: <TemperatureIcon />,
    tone: "amber",
    label: "symptoms",
    allTarget: "/symptom",
    itemHref: (v) => `/symptom/${encodeURIComponent(v)}`,
    hrefFor: (v) => `/symptom?category=${encodeURIComponent(v)}`,
  },
  {
    key: "clinicCategories",
    description: "megaDescClinics",
    icon: <BuildingIcon />,
    tone: "sky",
    label: "clinics",
    allTarget: "/clinic",
    itemHref: (v) => `/clinic/${encodeURIComponent(v)}`,
    hrefFor: (v) => `/clinic?category=${v}`,
  },
  {
    key: "paraClinicCategories",
    description: "megaDescParaClinics",
    icon: <FlaskIcon />,
    tone: "teal",
    label: "paraClinics",
    allTarget: "/paraClinic",
    itemHref: (v) => `/paraClinic/${encodeURIComponent(v)}`,
    hrefFor: (v) => `/paraClinic?category=${v}`,
  },
  {
    key: "hospitalCategories",
    description: "megaDescHospitals",
    icon: <HospitalIcon />,
    tone: "rose",
    label: "hospitals",
    allTarget: "/hospital",
    itemHref: (v) => `/hospital/${encodeURIComponent(v)}`,
    hrefFor: (v) => `/hospital?category=${v}`,
  },
  {
    key: "serviceCategories",
    description: "megaDescServices",
    icon: <MedicalReportIcon />,
    tone: "violet",
    label: "services",
    allTarget: "/service",
    hrefFor: (v) => `/service?category=${v}`,
  },
  {
    key: "productCategories",
    description: "megaDescProducts",
    icon: <PillIcon />,
    tone: "teal",
    label: "products",
    allTarget: "/product",
    itemHref: (v) => `/product/${encodeURIComponent(v)}`,
    hrefFor: (v) => `/product?category=${v}`,
  },
  {
    key: "insuranceCategories",
    description: "megaDescInsurances",
    icon: <ShieldCheckIcon />,
    tone: "sky",
    label: "insurances",
    allTarget: "/insurance",
    itemHref: (v) => `/insurance/${encodeURIComponent(v)}`,
    hrefFor: (v) => `/insurance?category=${v}`,
  },
  {
    key: "testCategories",
    description: "megaDescTests",
    icon: <MedicalRecordIcon />,
    tone: "amber",
    label: "tests",
    allTarget: "/test",
    itemHref: (v) => `/test/${encodeURIComponent(v)}`,
    hrefFor: (v) => `/test?category=${encodeURIComponent(v)}`,
  },
  {
    key: "blogCategories",
    description: "megaDescBlogs",
    icon: <BookOpenIcon />,
    tone: "violet",
    label: "blogs",
    allTarget: "/mag",
    // the blog list filters by ?category= (there is no /mag/category route)
    itemHref: (v) => `/mag/${encodeURIComponent(v)}`,
    hrefFor: (v) => `/mag?category=${encodeURIComponent(v)}`,
  },
];
