import FaqItem from "./FaqItem";
import classes from "./FaqList.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { FaqLink } from "../Seo/autoFaq";

const LOCALE_NS: ContentNamespace[] = ["common"];

type FaqListItem = {
  id?: string;
  _id?: string;
  question: string;
  answer: string;
  link?: FaqLink;
};

// The FAQ block of the public profiles (doctor, clinic, hospital, lab,
// pharmacy): the automatic questions built from the profile's data
// (Components/Seo/autoFaq.ts) and the provider's own, as one accordion.
const FaqList = ({
  items,
  title,
  id,
  className = "",
}: {
  items: FaqListItem[];
  title?: string;
  id?: string;
  className?: string;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const list = (Array.isArray(items) ? items : []).filter(
    (item) => !!item && !!item.question && !!item.answer,
  );

  if (!list.length) return null;
  return (
    <section className={`${classes.main} ${className}`} id={id}>
      <h2 className={classes.title}>{title || getContent("faqs")}</h2>
      <div className={classes.list}>
        {list.map((item, i) => (
          <FaqItem key={item.id || item._id || i} node={item} />
        ))}
      </div>
    </section>
  );
};

export default FaqList;
