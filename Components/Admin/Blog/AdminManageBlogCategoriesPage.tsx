"use client";

import { IBlogCategory } from "./AdminManageBlogsPage";
import AdminCatalogList from "../UI/AdminCatalogList";
import { FormRenderer } from "../UI/CreateForm";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

const blogCategoryFormRenderer: FormRenderer<IBlogCategory> = {
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
  order: {
    type: "number",
    get title() {
      return ta("رتبه");
    },
  },
};

// BlogCategory has no isActive in the backend, so no status column
const AdminManageBlogCategoriesPage = () => {
  const hasAccess = useAccessLevel();
  return (
    <AdminCatalogList<IBlogCategory>
      model="blogcategory"
      title={ta("دسته بندی مقالات")}
      noun={ta("دسته‌بندی مقاله")}
      fields={blogCategoryFormRenderer}
      labelField="title"
      showStatus={false}
      access={{
        create: hasAccess("BlogCategory", "write"),
        edit: hasAccess("BlogCategory", "update"),
        delete: hasAccess("BlogCategory", "delete"),
      }}
    />
  );
};

export default AdminManageBlogCategoriesPage;
