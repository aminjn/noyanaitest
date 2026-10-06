import { SwiperSlide } from "swiper/react";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import SwiperSlider from "../UI/SwiperSlider";
import SectionHeader from "../UI/SectionHeader";
import classes from "./HomeBlogs.module.css";
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
      <SectionHeader
        title={getContent("blog")}
        description={getContent("megaDescBlogs")}
        action={{ href: "/mag", label: getContent("seeAll") }}
      />
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
