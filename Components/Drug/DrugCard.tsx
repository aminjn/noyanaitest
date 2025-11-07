import Image from "next/image";
import { IDrug } from "../Admin/Disease/AdminManageDiseasesPage";
import classes from "./DrugCard.module.css";
import { imagePath } from "../helpers/imagepath";
import Link from "next/link";
import useLocale from "../Hooks/useLocale";
const DrugCard = ({ node }: { node: IDrug }) => {
  const getContent = useLocale();

  return (
    <li className={classes.main}>
      <div className={classes.image}>
        <Image
          alt={node.name || ""}
          src={imagePath(node.image)}
          fill
          style={{ objectFit: "cover" }}
          sizes="20rem"
        />
      </div>
      <div className={classes.content}>
        <h2 className={classes.title}>
          <Link href={`/drug/${node.slug || node.name}`}>{node.name}</Link>
        </h2>
        <p className={classes.summary}>{node.summary}</p>
        <Link href={`/drug/${node.slug || node.name}`} className={classes.more}>
          {getContent("readMore")}
        </Link>
      </div>
    </li>
  );
};

export default DrugCard;
