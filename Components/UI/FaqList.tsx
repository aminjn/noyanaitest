import { IDoctorFaq } from "../DoctorPanel/Profile/DoctorManageFaqTab";
import FaqItem from "./FaqItem";
import classes from "./FaqList.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const FaqList = ({ items }: { items: IDoctorFaq[] }) => {
  const getContent = useScopedLocale(LOCALE_NS);

  if (!items.length) return null;
  return (
    <section className={classes.main}>
      <h2 className={classes.title}>{getContent("faqs")}</h2>
      <div className={classes.list}>
        {items.map((item) => (
          <FaqItem key={item._id} node={item} />
        ))}
      </div>
    </section>
  );
};

export default FaqList;
