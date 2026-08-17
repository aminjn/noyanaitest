import Image from "next/image";
import { IService } from "../Admin/Service/AdminManageServicesPage";
import classes from "./ServiceCard.module.css";
import { imagePath } from "../helpers/imagepath";
import Ixon from "./Ixon";
import CrownIcon from "../Icons/CrownIcon";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import LocationIcon from "../Icons/LocationIcon";
import useComplexLocale from "../Hooks/useComplexLocale";
import StarIcon from "../Icons/StarIcon";
import { currencize } from "../helpers/currencize";
import {
  t2xsMedium,
  t2xsRegular,
  tsmDemiBold,
  tsmMedium,
  txsRegular,
} from "./Typography";

const ServiceCard = ({
  node,
}: {
  node: IService<{ Owner: Record<never, never> }>;
}) => {
  const getCompContent = useComplexLocale();

  return (
    <div className={classes.main}>
      <div className={classes.image}>
        <Image
          src={imagePath(node.image)}
          alt={node.name || ""}
          style={{ objectFit: "contain" }}
          fill
          sizes="16.25rem"
        />
      </div>
      <div className={classes.titleBox}>
        <Ixon className={classes.crown} width="1rem">
          <CrownIcon />
        </Ixon>
        <h4 className={`${classes.title} ${tsmDemiBold}`}>{node.name}</h4>
      </div>
      {!!node.owner && (
        <div className={classes.owner}>
          <div className={classes.ownerImage}>
            <Image
              src={imagePath(node.owner.avatar)}
              alt={getDoctorProfileLabel(node.owner)}
              fill
              sizes="2reem"
              style={{ objectFit: "cover" }}
            />
          </div>
          <span className={`${classes.ownerName} ${t2xsRegular}`}>
            {getDoctorProfileLabel(node.owner)}
          </span>
        </div>
      )}
      <div className={classes.details}>
        {!!node.owner && (
          <div className={classes.addressBox}>
            <Ixon width=".75rem">
              <LocationIcon />
            </Ixon>
            <span className={t2xsRegular}>
              {`${node.owner.province ? `${node.owner.province}، ` : ""}${node.owner.city || ""}`}
            </span>
          </div>
        )}
        <div className={classes.scoreBox}>
          <span className={`${classes.commentCount} ${t2xsRegular}`}>
            {getCompContent("xComment", [node.commentCount.toString()])}
          </span>
          <span className={`${classes.score} ${t2xsRegular}`}>
            {node.averageScore.toFixed(1)}
          </span>
          <Ixon className={classes.star} width="1rem">
            <StarIcon />
          </Ixon>
        </div>
      </div>
      <div className={classes.stats}>
        {node.discount && (
          <div className={classes.discountBox}>
            <s className={`${classes.striked} ${t2xsMedium}`}>{node.price}</s>
            {!!node.price && (
              <span className={`${classes.discountPercent} ${t2xsMedium}`}>
                {Math.floor(node.discount / node.price)} %
              </span>
            )}
          </div>
        )}
        <div className={classes.statFooter}>
          <span className={`${classes.remaining} ${txsRegular}`}>
            {getCompContent("onlyXRemaining", [node.inventory.toString()])}
          </span>
          <div className={`${classes.price} ${tsmMedium}`}>
            {getCompContent("xToman", [
              currencize(Math.floor(node.price / 10)),
            ])}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
