"use client";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import { IServicePackage } from "../Admin/ServicePackage/AdminManageServicePackagesPage";
import CommentSection from "../Comment/CommentSection";
import useLocale from "../Hooks/useLocale";
import StarDotPlusIcon from "../Icons/StartDotPlusIcon";
import CartableNodePage from "../Product/Cartable/CartabaleNodePage";
import { ProductTab, WhyBox } from "../Product/ProductTabs";
import { DiffCalc } from "../ProductPackage/ProductPackagePageTabs";
import ThinOwner from "../ProductPackage/ThinOwner";
import ServiceCard from "../Service/ServiceCard";
import RenderRtf from "../UI/RenderRtf";

export type ServicepackagePageProps = {
  data: IServicePackage<{
    Category: Record<never, never>;
    Images: Record<never, never>;
    Specs: Record<never, never>;
    Services: Record<never, never>;
    Owner: Record<never, never>;
    SameAs: {
      Category: Record<never, never>;
      Owner: { Province: Record<never, never> };
      Services: Record<never, never>;
    };
  }>;
};

const ServicePackagePage = ({ data }: ServicepackagePageProps) => {
  const getContent = useLocale();

  console.log(data);

  return (
    <CartableNodePage
      cartTitle="provider"
      commentsCount={data.commentCount}
      images={data.images}
      itemId={data._id}
      model="servicePackages"
      qnaCount={500}
      sameAs={data.sameAs.map((el) => (
        <ServiceCard key={el._id} node={{ ...el, model: "ServicePackage" }} />
      ))}
      sameAsIcon={<StarDotPlusIcon />}
      sameAsTitle="similarPackages"
      score={data.averageScore}
      specs={data.specs}
      totalScore={data.commentCount}
      category={data.category ? { name: data.category.title } : undefined}
      name={data.name}
      discount={data.discount}
      price={data.price}
      owner={
        data.owner ? (
          <ThinOwner
            name={getDoctorProfileLabel(data.owner)}
            src={data.owner.avatar}
          />
        ) : undefined
      }
      tabs={[
        {
          id: "Description",
          title: getContent("aboutPackage"),
          content: (
            <ProductTab title={getContent("aboutPackage")}>
              {!!data.summary && <p>{data.summary}</p>}
              <DiffCalc items={data.services} price={data.price} />
              <RenderRtf value={data.description} />
              <WhyBox content={data.whyChoose} />
            </ProductTab>
          ),
        },
        {
          id: "Stages",
          title: getContent("procedure"),
          content: (
            <ProductTab title={getContent("procedure")}>
              <RenderRtf value={data.stages} />
            </ProductTab>
          ),
          exclude: !data.stages,
        },
        {
          id: "results",
          title: getContent("resultsAndAdvantages"),
          content: (
            <ProductTab title={getContent("resultsAndAdvantages")}>
              <RenderRtf value={data.results} />
            </ProductTab>
          ),
          exclude: !data.results,
        },
        {
          id: "Comments",
          title: getContent("comments"),
          content: <CommentSection model="ServicePackage" nodeId={data._id} />,
        },
      ]}
    />
  );
};

export default ServicePackagePage;
