import { SwiperSlide } from "swiper/react";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import ChevronIcon from "../Icons/ChevronIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import SwiperSlider from "../UI/SwiperSlider";
import { tlgMedium } from "../UI/Typography";
import classes from "./HomeBlogs.module.css";
import BlogMainCard from "../Blog/BlogMainCard";
import BlogCardHome from "./BlogCardHome";

const NS: ContentNamespace[] = ["common", "home"];

const HomeBlogs = ({
  nodes,
}: {
  nodes?: IBlog<{ CategoryPopulated: Record<never, never> }>[];
}) => {
  const getContent = useScopedLocale(NS);

  if (!nodes?.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <h3 className={`${classes.title} ${tlgMedium}`}>
          {getContent("blog")}
        </h3>
        <Button
          variant="Primary"
          mode="Inline"
          size="S"
          tailIcon={
            <Ixon style={{ transform: "rotateZ(90deg)" }}>
              <ChevronIcon />
            </Ixon>
          }
          className={classes.all}
          href="/mag"
        >
          {getContent("seeAll")}
        </Button>
      </div>
      <div className={classes.mobileList}>
        {nodes.map((node) => (
          <BlogCardHome node={node} key={node._id} />
        ))}
      </div>
      <div className={classes.list}>
        <SwiperSlider>
          {nodes.map((node) => (
            <SwiperSlide tag="li" key={node._id} className={classes.slide}>
              <BlogCardHome node={node} />
            </SwiperSlide>
          ))}
        </SwiperSlider>
      </div>
    </div>
  );
};

export default HomeBlogs;
