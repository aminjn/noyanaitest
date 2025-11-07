import Image from "next/image";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import classes from "./SpecialityCard.module.css";
import { imagePath } from "../helpers/imagepath";
import Link from "next/link";
import useLocale from "../Hooks/useLocale";

const SpecialityCard = ({ node }: { node: ISpeciality }) => {
  const getContent = useLocale();

  return (
    <li className={classes.main}>
      <div className={classes.image}>
        <Image
          alt={node.name || ""}
          src={imagePath(node.image)}
          sizes="30rem"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={classes.content}>
        <h2 className={classes.title}>
          <Link
            href={`/speciality/${node.slug || node.name}`}
            className={classes.link}
          >
            <span className={classes.name}>{node.name}</span>
            {(!!node.doctorsCountWithMainSpeciality ||
              !!node.doctorsCountWithSideSpeciality) && (
              <span className={classes.count}>{`(+${
                (node.doctorsCountWithMainSpeciality || 0) +
                (node.doctorsCountWithSideSpeciality || 0)
              } ${getContent("doctor")})`}</span>
            )}
          </Link>
        </h2>
        {!!node.summary && <p className={classes.summary}>{node.summary}</p>}
        <Link
          className={classes.more}
          href={`/speciality/${node.slug || node.name}`}
        >
          {getContent("seeDoctors")}
        </Link>
      </div>
    </li>
  );
};

export default SpecialityCard;
