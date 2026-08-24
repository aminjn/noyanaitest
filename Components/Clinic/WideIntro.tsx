import Image from "next/image";
import useLocale from "../Hooks/useLocale";
import classes from "./WideIntro.module.css";
import { FilePath } from "../config";
import Badge from "../UI/Badge";
import { t4xlBold, tsmRegular } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import LocationIcon from "../Icons/LocationIcon";
import StarIcon from "../Icons/StarIcon";
import HostedImage from "../UI/HostedImage";
const WideIntro = ({
  category,
  image,
  name,
  province,
  commentCount = 0,
  score = 0,
}: {
  name?: string;
  image?: string;
  category?: string;
  province?: string;
  score?: number;
  commentCount?: number;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <HostedImage
        alt={name || ""}
        src={image}
        fill
        sizes="61.375rem"
        style={{ objectFit: "cover" }}
      />
      <div className={classes.header}>
        <div className={classes.intro}>
          {!!category && (
            <Badge color="Disabled" size="L" radius="High" mode="Fill">
              {category}
            </Badge>
          )}
          <h1 className={`${classes.name} ${t4xlBold}`}>{name}</h1>
        </div>
        <div className={classes.details}>
          {!!province && (
            <div className={`${classes.province} ${tsmRegular}`}>
              <Ixon width=".875rem">
                <LocationIcon />
              </Ixon>
              <span>{province}</span>
            </div>
          )}
          <div className={`${classes.stats} ${tsmRegular}`}>
            <Ixon width=".875rem">
              <StarIcon />
            </Ixon>
            <span>{`${score} (${getContent("xComments", [commentCount?.toString()])})`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WideIntro;
