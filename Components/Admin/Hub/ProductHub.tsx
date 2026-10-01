"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageProductCategoriesPage from "@/Components/Admin/ProductCategory/AdminManageProductCategoriesPage";
import AdminManageProductPackagesPage from "@/Components/Admin/ProductPackage/AdminManageProductPackagesPage";
import AdminManageProductsPage from "@/Components/Admin/Product/AdminManageProductsPage";

// محصولات: one admin page, its parts as tabs (2026-09 admin audit).
const ProductHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("محصولات")}
      tabs={[
        {
          id: "products",
          title: ta("محصولات"),
          exclude: !canOpen("Product"),
          content: <AdminManageProductsPage />,
        },
        {
          id: "packages",
          title: ta("پکیج‌های محصول"),
          exclude: !canOpen("Product"),
          content: <AdminManageProductPackagesPage />,
        },
        {
          id: "categories",
          title: ta("دسته‌ها"),
          exclude: !canOpen("Product"),
          content: <AdminManageProductCategoriesPage />,
        },
      ]}
    />
  );
};

export default ProductHub;
