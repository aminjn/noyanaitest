"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type ParaClinicCategoryPopulation = Population<Record<never, never>>;

export interface IParaClinicCategory<
  T extends ParaClinicCategoryPopulation = ParaClinicCategoryPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
  slug?: string;
}

const paraClinicCategoryFormRenderer: FormRenderer<IParaClinicCategory> = {
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

const AdminManageParaClinicCategoriesPage = () => (
  <AdminCatalogList<IParaClinicCategory>
    model="paraClinicCategory"
    title={ta("دسته بندی پاراکلینیک")}
    noun={ta("دسته‌بندی پاراکلینیک")}
    fields={paraClinicCategoryFormRenderer}
  />
);

export default AdminManageParaClinicCategoriesPage;
