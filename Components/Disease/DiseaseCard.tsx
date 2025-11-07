import Link from "next/link";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import classes from "./DiseaseCard.module.css";
import useLocale from "../Hooks/useLocale";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";

const DiseaseCard = ({ node }: { node: IDisease }) => {
  const getContent = useLocale();

  return (
    <li className={classes.main}>
      <div className={classes.image}>
        <Image
          alt={node.name || ""}
          src={imagePath(node.image)}
          fill
          sizes="30rem"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={classes.content}>
        <h2 className={classes.title}>
          <Link href={`/disease/${node.slug || node.name}`}>{node.name}</Link>
        </h2>
        <p className={classes.summary}>{node.summary}</p>
        <Link
          href={`/disease/${node.slug || node.name}`}
          className={classes.more}
        >
          {getContent("readMore")}
        </Link>
      </div>
    </li>
  );
};

export default DiseaseCard;
