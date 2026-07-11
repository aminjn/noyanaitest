import { getPublicData } from "@/Components/helpers/getPublicData";
import ProductPage, {
  ProductPageProps,
} from "@/Components/Product/ProductPage";
import { notFound } from "next/navigation";

const Product = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ProductPageProps>(
    `/product/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  return <ProductPage {...data} />;
};

export default Product;
