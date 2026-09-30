"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type ServiceCategoryPopulation = Population<Record<never, never>>;
export interface IServiceCategory<
  T extends ServiceCategoryPopulation = ServiceCategoryPopulation,
> extends MongoDoc {
  title?: string;
  isActive: boolean;
  order: number;
  slug?: string;
}

const serviceCategoryFormRenderer: FormRenderer<IServiceCategory> = {
  title: {
    type: "text",
    get title() {
      return ta("عنوان");
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

const AdminManageServiceCategoriesPage = () => (
  <AdminCatalogList<IServiceCategory>
    model="serviceCategory"
    title={ta("دسته بندی های خدمات")}
    noun={ta("دسته‌بندی خدمت")}
    fields={serviceCategoryFormRenderer}
    labelField="title"
  />
);

export default AdminManageServiceCategoriesPage;
