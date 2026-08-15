import { Fragment, ReactNode } from "react";
import { IProduct } from "../Admin/Product/AdminManageProductsPage";
import useLocale from "../Hooks/useLocale";
import ClientTabSystem from "../UI/ClientTabSystem";
import classes from "./ProductTabs.module.css";
import RenderRtf from "../UI/RenderRtf";
import Ixon from "../UI/Ixon";
import MedalIcon from "../Icons/MedalIcon";
import BookAltIcon from "../Icons/BookAltIcon";
import TagIcon from "../Icons/TagIcon";
import PillIcon from "../Icons/PillIcon";
import AlertTriangleIcon from "../Icons/AlertTriangleIcon";
import StarIcon from "../Icons/StarIcon";
import ChatBubbleIcon from "../Icons/ChatBubbleIcon";
import QnaSection from "./QnaSection";
import { tsmMedium, txsRegular } from "../UI/Typography";
import CommentSection from "../Comment/CommentSection";

export const WhyBox = ({ content }: { content?: string }) => {
  const getContent = useLocale();

  if (!content) return null;
  return (
    <div className={classes.whyBox}>
      <div className={`${classes.whyHeader} ${tsmMedium}`}>
        <Ixon width="1rem">
          <MedalIcon />
        </Ixon>
        <span>{getContent("whyThisProduct")}</span>
      </div>
      <p className={`${classes.whyContent} ${txsRegular}`}>{content}</p>
    </div>
  );
};

export const ProductTab = ({
  children,
  title,
}: {
  title: string;
  children?: ReactNode;
}) => {
  return (
    <div className={classes.tab}>
      <span className={classes.tabTitle}>{title}</span>
      {children}
    </div>
  );
};

const ProductTabs = ({ data }: { data: IProduct }) => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <ClientTabSystem
        items={[
          {
            content: (
              <ProductTab title={getContent("description")}>
                <RenderRtf value={data.description} />
                <WhyBox content={data.whyChoose} />
              </ProductTab>
            ),
            id: "Description",
            title: getContent("description"),
            exclude: !data.description && !data.whyChoose,
            icon: <BookAltIcon />,
          },
          {
            content: (
              <ProductTab title={getContent("details")}>
                <RenderRtf value={data.details} />
              </ProductTab>
            ),
            id: "Details",
            title: getContent("details"),
            exclude: !data.details,
            icon: <TagIcon />,
          },
          {
            title: getContent("productUsage"),
            id: "Usage",
            exclude: !data.usage,
            icon: <PillIcon />,
            content: (
              <ProductTab title={getContent("productUsage")}>
                <RenderRtf value={data.usage} />
              </ProductTab>
            ),
          },
          {
            title: getContent("warnings"),
            id: "Warnings",
            exclude: !data.warning,
            content: (
              <ProductTab title={getContent("warnings")}>
                <RenderRtf value={data.warning} />
              </ProductTab>
            ),
            icon: <AlertTriangleIcon />,
          },
          {
            title: getContent("comments"),
            id: "Comments",
            content: <CommentSection model="Product" nodeId={data._id} />,
            icon: <StarIcon />,
          },
          {
            title: getContent("qna"),
            id: "Qna",
            icon: <ChatBubbleIcon />,
            content: <QnaSection />,
          },
        ]}
      />
    </div>
  );
};

export default ProductTabs;
