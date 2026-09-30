"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

export type ProductCategoryPopulation = Population<Record<never, never>>;

export interface IProductCategory<
  T extends ProductCategoryPopulation = ProductCategoryPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
}

const productCategoryFormRenderer: FormRenderer<IProductCategory> = {
  name: {
    type: "text",
    get title() {
      return ta("نام");
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

const AdminManageProductCategoriesPage = () => (
  <AdminCatalogList<IProductCategory>
    model="productCategory"
    title={ta("دسته بندی محصولات")}
    noun={ta("دسته‌بندی محصول")}
    fields={productCategoryFormRenderer}
  />
);

export default AdminManageProductCategoriesPage;
