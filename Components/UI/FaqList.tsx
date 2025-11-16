import { IDoctorFaq } from "../DoctorPanel/Profile/DoctorManageFaqTab";
import useLocale from "../Hooks/useLocale";
import FaqItem from "./FaqItem";
import classes from "./FaqList.module.css";

const FaqList = ({ items }: { items: IDoctorFaq[] }) => {
  const getContent = useLocale();

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
