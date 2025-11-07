import Image from "next/image";
import { ISymptom } from "../Admin/Disease/AdminManageDiseasesPage";
import useLocale from "../Hooks/useLocale";
import classes from "./SymptomCard.module.css";
import { imagePath } from "../helpers/imagepath";
import Link from "next/link";

const SymptomCard = ({ node }: { node: ISymptom }) => {
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
          <Link href={`/symptom/${node.name || node.slug}`}>{node.name}</Link>
        </h2>
        <p className={classes.summary}>{node.summary}</p>
        <Link
          href={`/symptom/${node.slug || node.name}`}
          className={classes.more}
        >
          {getContent("readMore")}
        </Link>
      </div>
    </li>
  );
};

export default SymptomCard;
