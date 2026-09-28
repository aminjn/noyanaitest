"use client";

import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import { IService } from "../Admin/Service/AdminManageServicesPage";
import CommentSection from "../Comment/CommentSection";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import StarDotPlusIcon from "../Icons/StartDotPlusIcon";
import CartableNodePage from "../Product/Cartable/CartabaleNodePage";
import { ProductTab, WhyBox } from "../Product/ProductTabs";
import ThinOwner from "../ProductPackage/ThinOwner";
import RenderRtf from "../UI/RenderRtf";
import ServiceCard from "./ServiceCard";
import classes from "./ServicePage.module.css";

const NS: ContentNamespace[] = ["common", "services"];

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
  const getContent = useScopedLocale(NS);

  return (
    <CartableNodePage
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("services"), target: "/service" },
        {
          title: data.name || data._id,
          target: `/service/${data.slug || data._id}`,
        },
      ]}
      cartTitle="provider"
      commentsCount={data.commentCount}
      images={data.images}
      itemId={data._id}
      model="services"
      sameAs={data.sameAs.map((el) => (
        <ServiceCard key={el._id} node={{ ...el, model: "Service" }} />
      ))}
      sameAsIcon={<StarDotPlusIcon />}
      sameAsTitle={"similarServices"}
      score={data.averageScore}
      specs={data.specs}
      totalScore={data.commentCount}
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
            <ProductTab title={getContent("aboutService")} key="Description">
              <RenderRtf value={data.description} />
              <WhyBox content={data.whyChoose} />
            </ProductTab>
          ),
        },
        {
          id: "stages",
          title: getContent("procedure"),
          content: (
            <ProductTab title={getContent("procedure")} key={"Stages"}>
              <RenderRtf value={data.stages} />
            </ProductTab>
          ),
          exclude: !data.stages,
        },
        {
          id: "Results",
          title: getContent("resultsAndAdvantages"),
          content: (
            <ProductTab
              title={getContent("resultsAndAdvantages")}
              key="Results"
            >
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
