import { getPublicData } from "@/Components/helpers/getPublicData";
import ProductPackagePage, {
  ProductPackagePageProps,
} from "@/Components/ProductPackage/ProductPackagePage";
import { notFound } from "next/navigation";

const ProductPackage = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ProductPackagePageProps>(
    `productPackage/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  return <ProductPackagePage {...data} />;
};

export default ProductPackage;
