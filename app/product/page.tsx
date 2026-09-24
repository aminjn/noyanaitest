import { getPublicData } from "@/Components/helpers/getPublicData";
import ProductListPage, {
  ProductListPageProps,
} from "@/Components/Product/ProductListPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "common",
  "products",
  "productServiceSwitch",
  "productServiceCard",
];

export const generateMetadata = () => getListPageMetadata("/product");

const ProductList = async (ctx: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    category?: string;
    packageOnly?: string;
  }>;
}) => {
  const { page: _page, search, category, packageOnly } = await ctx.searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  if (search) params.append("query", search);
  if (category) params.append("category", category);
  if (packageOnly) params.append("packageOnly", "1");
  const [data, textContent] = await Promise.all([
    getPublicData<ProductListPageProps>(`product?${params.toString()}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/product");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <ProductListPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default ProductList;
