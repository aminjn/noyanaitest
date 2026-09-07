import Badge from "@/Components/UI/Badge";
import classes from "./LicenseCard.module.css";
import {
  IBaseLicense,
  IBaseLicensePricing,
  ILicenseDuration,
  LicenseOrg,
  licensePanelRootByOrg,
} from "./licenseTypes";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Ixon from "@/Components/UI/Ixon";
import CrownIcon from "@/Components/Icons/CrownIcon";
import { useMemo } from "react";
import Button from "@/Components/UI/Button";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import { tsmBold } from "@/Components/UI/Typography";
import LicensePriceDetails from "./LicensePriceDetails";

const LicenseCard = ({
  duration,
  license,
  org,
}: {
  org: LicenseOrg;
  license: IBaseLicense;
  duration: ILicenseDuration | null;
}) => {
  const getContent = useScopedLocale(["common"]);

  const pricing = useMemo<IBaseLicensePricing | null>(
    () => license.pricing.find((el) => el.duration === duration?._id) || null,
    [license, duration],
  );

  return (
    <div className={`${classes.main} ${license.isGolden ? classes.alt : ""}`}>
      <div className={classes.badges}>
        {license.isDiscounted && (
          <Badge color="Error" radius="High" mode="Fill" size="L">
            {getContent("specialDiscount")}
          </Badge>
        )}
        {license.isRecommended && (
          <Badge size="L" mode="Fill" radius="High" color="Primarylight">
            {getContent("specialOffer")}
          </Badge>
        )}
      </div>
      <div className={classes.nameBox}>
        <Ixon width="1.5rem" className={`${classes.icon}`}>
          <CrownIcon />
        </Ixon>
        <span className={`${classes.name} ${tsmBold}`}>
          {license.displayName}
        </span>
      </div>
      <LicensePriceDetails duration={duration} pricing={pricing} />
      <div className={classes.features}>
        {license.descriptions.map((el) => (
          <p key={el} className={classes.feature}>
            {el}
          </p>
        ))}
      </div>
      <Button
        className={classes.action}
        href={`${licensePanelRootByOrg[org]}/license/${license._id}`}
        tailIcon={
          <Ixon style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        }
        size="M"
        mode="Fill"
        radius="Medium"
        variant="Primary"
      >
        {getContent("chooseLicense")}
      </Button>
    </div>
  );
};

export default LicenseCard;
