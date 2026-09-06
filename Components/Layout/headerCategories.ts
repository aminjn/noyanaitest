import { ContentKey } from "../Enums/contentKeys";
import { IBlogCategory } from "../Admin/Blog/AdminManageBlogsPage";
import { IProductCategory } from "../Admin/ProductCategory/AdminManageProductCategoriesPage";
import { IDiseaseCategory } from "../Admin/DiseaseCategory/AdminManageDiseaseCategoriesPage";
import { IClinicCategory } from "../Admin/ClinicCategory/AdminManageClinicCategoriesPage";
import { IParaClinicCategory } from "../Admin/ParaClinicCategory/AdminManageParaClinicCategoriesPage";
import { IHospitalCategory } from "../Admin/HospitalCategory/AdminManageHospitalCategoriesPage";
import { ITestCategory } from "../Admin/TestCategory/AdminManageTestCategoriesPage";
import { IServiceCategory } from "../Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import { ISpecialityCategory } from "../Admin/SpecialityCategory/AdminManageSpecialityCategoriesPage";
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
  specialityCategories: ISpecialityCategory[];
  symptomCategories: ISymptomCategory[];
  insuranceCategories: IInsuranceCategory[];
}

export type CategoryLike = {
  _id: string;
  slug?: string;
  name?: string;
  title?: string;
};

export const categoryTabs: {
  key: keyof HeaderCategories;
  label: ContentKey;
  allTarget: string;
  hrefFor: (value: string) => string;
}[] = [
  {
    key: "specialityCategories",
    label: "specialities",
    allTarget: "/speciality",
    hrefFor: (v) => `/speciality?category=${v}`,
  },
  {
    key: "diseaseCategories",
    label: "diseases",
    allTarget: "/disease",
    hrefFor: (v) => `/disease?category=${v}`,
  },
  {
    key: "symptomCategories",
    label: "symptoms",
    allTarget: "/symptom",
    hrefFor: () => "/symptom",
  },
  {
    key: "clinicCategories",
    label: "clinics",
    allTarget: "/clinic",
    hrefFor: (v) => `/clinic?category=${v}`,
  },
  {
    key: "paraClinicCategories",
    label: "paraClinics",
    allTarget: "/paraClinic",
    hrefFor: (v) => `/paraClinic?category=${v}`,
  },
  {
    key: "hospitalCategories",
    label: "hospitals",
    allTarget: "/hospital",
    hrefFor: (v) => `/hospital?category=${v}`,
  },
  {
    key: "serviceCategories",
    label: "services",
    allTarget: "/service",
    hrefFor: (v) => `/service?category=${v}`,
  },
  {
    key: "productCategories",
    label: "products",
    allTarget: "/product",
    hrefFor: (v) => `/product?category=${v}`,
  },
  {
    key: "insuranceCategories",
    label: "insurances",
    allTarget: "/insurance",
    hrefFor: (v) => `/insurance?category=${v}`,
  },
  {
    key: "testCategories",
    label: "tests",
    allTarget: "/test",
    hrefFor: () => "/test",
  },
  {
    key: "blogCategories",
    label: "blogs",
    allTarget: "/mag",
    hrefFor: (v) => `/mag/category/${v}`,
  },
];
