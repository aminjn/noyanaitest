import { ReactNode } from "react";
import useLocale from "../Hooks/useLocale";
import LocationIcon from "../Icons/LocationIcon";
import IconTitle from "../UI/IconTitle";
import classes from "./InsuranceContact.module.css";
import { InsurancePageNode } from "./InsurancePage";
import Ixon from "../UI/Ixon";
import CallingIcon from "../Icons/CallingIcon";
import WebsiteIcon from "../Icons/WEbsiteIcon";
import DocumentIcon from "../Icons/DocumentIcon";
import { tsmRegular } from "../UI/Typography";

const Item = ({ icon, value }: { icon: ReactNode; value?: string }) => {
  if (!value) return null;
  return (
    <div className={classes.item}>
      <Ixon width="1rem" className={classes.itemIcon}>
        {icon}
      </Ixon>
      <span className={`${classes.itemValue} ${tsmRegular}`}>{value}</span>
    </div>
  );
};

const InsuranceContact = ({ node }: { node: InsurancePageNode }) => {
  const getContent = useLocale();
  return (
    <div className={classes.main}>
      <IconTitle icon={<LocationIcon />}>{getContent("contactInfo")}</IconTitle>
      <div className={classes.box}>
        <Item icon={<CallingIcon />} value={node.phone} />
        <Item icon={<WebsiteIcon />} value={node.website} />
        <Item
          icon={<DocumentIcon />}
          value={
            node.establishment
              ? getContent("establishedAtx", [node.establishment])
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default InsuranceContact;
