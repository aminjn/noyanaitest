"use client";

import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import { IService } from "../Admin/Service/AdminManageServicesPage";
import CommentSection from "../Comment/CommentSection";
import useLocale from "../Hooks/useLocale";
import StarDotPlusIcon from "../Icons/StartDotPlusIcon";
import CartableNodePage from "../Product/Cartable/CartabaleNodePage";
import { ProductTab, WhyBox } from "../Product/ProductTabs";
import ThinOwner from "../ProductPackage/ThinOwner";
import RenderRtf from "../UI/RenderRtf";
import ServiceCard from "./ServiceCard";
import classes from "./ServicePage.module.css";

export type ServicePageProps = {
  data: IService<{
    Images: Record<never, never>;
    Specs: Record<never, never>;
    SameAs: {
      Owner: { Province: Record<never, never> };
      Category: Record<never, never>;
    };
    Owner: Record<never, never>;
    Category: Record<never, never>;
  }>;
};

const ServicePage = ({ data }: ServicePageProps) => {
  const getContent = useLocale();

  console.log(data);

  return (
    <CartableNodePage
      cartTitle="provider"
      commentsCount={500}
      images={data.images}
      itemId={data._id}
      model="services"
      qnaCount={500}
      sameAs={data.sameAs.map((el) => (
        <ServiceCard node={{ ...el, model: "Service" }} />
      ))}
      sameAsIcon={<StarDotPlusIcon />}
      sameAsTitle={"similarServices"}
      score={4.9}
      specs={data.specs}
      totalScore={4650}
      category={data.category ? { name: data.category.title } : undefined}
      discount={data.discount}
      name={data.name}
      price={data.price}
      owner={
        data.owner ? (
          <ThinOwner
            name={getDoctorProfileLabel(data.owner)}
            src={data.image}
          />
        ) : undefined
      }
      tabs={[
        {
          id: "Description",
          title: getContent("aboutService"),
          content: (
            <ProductTab title={getContent("aboutService")}>
              <RenderRtf value={data.description} />
              <WhyBox content={data.whyChoose} />
            </ProductTab>
          ),
        },
        {
          id: "stages",
          title: getContent("procedure"),
          content: (
            <ProductTab title={getContent("procedure")}>
              <RenderRtf value={data.stages} />
            </ProductTab>
          ),
          exclude: !data.stages,
        },
        {
          id: "Results",
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
          content: <CommentSection nodeId={data._id} model="Service" />,
        },
      ]}
    />
  );
};

export default ServicePage;
