"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type HospitalCategoryPopulation = Population<Record<never, never>>;

export interface IHospitalCategory<
  T extends HospitalCategoryPopulation = HospitalCategoryPopulation,
> extends MongoDoc {
  name?: string;
  slug?: string;
  isActive: boolean;
  order: number;
}

const hospitalCategoryFormRenderer: FormRenderer<IHospitalCategory> = {
  name: {
    type: "text",
    get title() {
      return ta("نام");
    },
  },
  slug: {
    type: "text",
    get title() {
      return ta("اسلاگ");
    },
  },
  isActive: {
    type: "bool",
    get title() {
      return ta("فعال");
    },
  },
  order: {
    type: "number",
    get title() {
      return ta("رتبه");
    },
  },
};

const AdminManageHospitalCategoriesPage = () => (
  <AdminCatalogList<IHospitalCategory>
    model="hospitalCategory"
    title={ta("دسته بندی بیمارتان ها")}
    noun={ta("دسته‌بندی بیمارستان")}
    fields={hospitalCategoryFormRenderer}
  />
);

export default AdminManageHospitalCategoriesPage;
