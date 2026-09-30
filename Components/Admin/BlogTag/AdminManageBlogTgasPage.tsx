"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import { TableRenderer } from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { ta } from "@/Components/Admin/i18n/adminText";

export type BlogTagPopulation = Population<Record<never, never>>;

export interface IBlogTag<
  T extends BlogTagPopulation = BlogTagPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
  hot: boolean;
}

export const blogTagFormRenderer: FormRenderer<IBlogTag> = {
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
  hot: {
    type: "bool",
    get title() {
      return ta("داغ");
    },
  },
  order: {
    type: "number",
    get title() {
      return ta("رتبه");
    },
  },
};

const AdminManageBlogTagsPage = () => (
  <AdminCatalogList<IBlogTag>
    model="blogTag"
    title={ta("تگ بلاگ")}
    noun={ta("تگ بلاگ")}
    fields={blogTagFormRenderer}
    columns={
      {
        hot: {
          name: ta("داغ"),
          value: (node) => booleanToValue[`${!!node.hot}`],
          component: (node) => <BooleanToIcon value={!!node.hot} />,
          filter: "Set",
        },
      } as TableRenderer<IBlogTag>
    }
  />
);

export default AdminManageBlogTagsPage;
