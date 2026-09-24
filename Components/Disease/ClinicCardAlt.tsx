import Image from "next/image";
import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";
import StarIcon from "../Icons/StarIcon";
import Badge from "../UI/Badge";
import classes from "./ClinicCardAlt.module.css";
import { FilePath } from "../config";
import Ixon from "../UI/Ixon";
import VerifyIcon from "../Icons/VerifyIcon";
import LocationIcon from "../Icons/LocationIcon";
import Button from "../UI/Button";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { t2xsRegular, tsmDemiBold, txsRegular } from "../UI/Typography";
import HostedImage from "../UI/HostedImage";

const NS: ContentNamespace[] = ["common", "diseasePage"];

const ClinicCardAlt = ({
  node,
}: {
  node: IClinic<{
    Category: Record<never, never>;
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }>;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <li className={classes.main}>
      <div className={classes.header}>
        <Badge
          size="S"
          radius="High"
          mode="Fill"
          color="Warning"
          leadIcon={<StarIcon />}
          className={classes.score}
        >
          4.5
        </Badge>
      </div>
      <div className={classes.image}>
        <HostedImage
          src={node.image}
          alt={node.name || ""}
          style={{ objectFit: "cover" }}
          fill
          sizes="3.5rem"
          className={classes.theImage}
        />
        <Ixon width="1rem" className={classes.verify}>
          <VerifyIcon />
        </Ixon>
      </div>
      <h3 className={`${classes.name} ${tsmDemiBold}`}>{node.name}</h3>
      {!!node.category && (
        <legend className={`${classes.category} ${txsRegular}`}>
          {node.category.name}
        </legend>
      )}
      {!!node.tags.length && (
        <div className={classes.tags}>
          {node.tags.map((tag) => (
            <Badge
              key={tag._id}
              color="Black"
              size="S"
              radius="High"
              mode="Outline"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
      {!!node.province && (
        <div className={classes.province}>
          <Ixon width="1rem">
            <LocationIcon />
          </Ixon>
          <span className={t2xsRegular}>{node.province.name}</span>
        </div>
      )}
      <Button
        className={classes.action}
        href={`/clinic/${node.slug || node._id}`}
        variant="Primary"
        mode="Fill"
        size="S"
        radius="Medium"
      >
        {getContent("visitProfile")}
      </Button>
    </li>
  );
};

export default ClinicCardAlt;
