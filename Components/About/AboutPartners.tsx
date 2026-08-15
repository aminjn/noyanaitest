import Image from "next/image";
import { IAboutPartner } from "../Admin/AboutPartner/AdminManageAboutPartnersPage";
import classes from "./AboutPartners.module.css";
import TitleLegend from "./TitleLegend";
import { FilePath } from "../config";
const AboutPartners = ({ items }: { items: IAboutPartner[] }) => {
  if (!items.length) return null;
  return (
    <div className={classes.main}>
      <TitleLegend title="aboutPartnersTitle" legend="aboutPartnersLegend" />
      <div className={classes.listContainer}>
        <ul className={classes.list}>
          {items.map((el) => (
            <li key={el._id} className={classes.item}>
              <Image
                src={`${FilePath}/${el.image}`}
                alt={el.name || ""}
                fill
                sizes="7.5rem"
                style={{ objectFit: "contain" }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AboutPartners;
