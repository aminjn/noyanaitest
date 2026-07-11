import { getPublicData } from "@/Components/helpers/getPublicData";
import ProductListPage, {
  ProductListPageProps,
} from "@/Components/Product/ProductListPage";
import { notFound } from "next/navigation";

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
  const data = await getPublicData<ProductListPageProps>(
    `product?${params.toString()}`,
  );
  if (!data) return notFound();
  return <ProductListPage {...data} />;
};

export default ProductList;
