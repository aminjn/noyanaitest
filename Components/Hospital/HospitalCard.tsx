import Image from "next/image";
import { IHospital } from "../Admin/Hospital/AdminManageHospitalsPage";
import classes from "./HospitalCard.module.css";
import { FilePath } from "../config";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import LocationIcon from "../Icons/LocationIcon";
import useLocale from "../Hooks/useLocale";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import Badge from "../UI/Badge";
import { tbaseMedium, txsRegular } from "../UI/Typography";

const HospitalCard = ({
  node,
}: {
  node: IHospital<{
    Province: Record<never, never>;
    Tags: Record<never, never>;
    Category: Record<never, never>;
  }>;
}) => {
  const getContent = useLocale();

  return (
    <li className={classes.main}>
      <div className={classes.image}>
        <Image
          alt={node.name || ""}
          src={`${FilePath}/${node.image}`}
          fill
          style={{ objectFit: "contain" }}
          sizes="24rem"
        />
      </div>
      <div className={classes.details}>
        <div className={classes.header}>
          <span className={`${classes.name} ${tbaseMedium}`}>{node.name}</span>
          <div className={classes.stats}>
            <span className={classes.commentCount}>(1530)</span>
            <div className={classes.score}>
              <Ixon width=".75rem">
                <StarIcon />
              </Ixon>
              <span className={txsRegular}>4.9</span>
            </div>
          </div>
        </div>
        {!!node.province && (
          <div className={classes.province}>
            <Ixon width=".75rem">
              <LocationIcon />
            </Ixon>
            <span>{node.province.name}</span>
          </div>
        )}
        <div className={`${classes.counts} ${txsRegular}`}>
          <div className={classes.count}>
            <Ixon width=".75rem"></Ixon>
            <span>{getContent("nBeds", [node.bedCount.toString()])}</span>
          </div>
          <div className={classes.count}>
            <Ixon width=".75rem">
              <StetoscopeIcon />
            </Ixon>
            <span>{getContent("nSpeciality", ["6"])}</span>
          </div>
        </div>
        {!!node.tags.length && (
          <div className={classes.tags}>
            {node.tags.map((tag) => (
              <Badge
                key={tag._id}
                color="Primarylight"
                size="S"
                radius="High"
                mode="Fill"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </li>
  );
};

export default HospitalCard;
