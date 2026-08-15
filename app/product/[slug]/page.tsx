import { getPublicData } from "@/Components/helpers/getPublicData";
import ProductPage, {
  ProductPageProps,
} from "@/Components/Product/ProductPage";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/product/[slug]", ctx.params.slug);

const Product = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ProductPageProps>(
    `/product/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/product/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <ProductPage {...data} />
    </>
  );
};

export default Product;
