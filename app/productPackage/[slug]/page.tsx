import { getPublicData } from "@/Components/helpers/getPublicData";
import ProductPackagePage, {
  ProductPackagePageProps,
} from "@/Components/ProductPackage/ProductPackagePage";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/productPackage/[slug]", ctx.params.slug);

const ProductPackage = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ProductPackagePageProps>(
    `productPackage/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/productPackage/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <ProductPackagePage {...data} />
    </>
  );
};

export default ProductPackage;
