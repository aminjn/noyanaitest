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
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "common",
  "productPackagePage",
  "productCartable",
  "productServiceCard",
  "commentSection",
];

export const generateMetadata = (ctx: { params: { slug: string } }) =>
  getNodePageMetadata("/productPackage/[slug]", ctx.params.slug);

const ProductPackage = async (ctx: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<ProductPackagePageProps>(`productPackage/${ctx.params.slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema(
    "/productPackage/[slug]",
    ctx.params.slug,
  );
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <ProductPackagePage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default ProductPackage;
