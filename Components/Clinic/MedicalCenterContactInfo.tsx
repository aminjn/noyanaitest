import useLocale from "../Hooks/useLocale";
import LocationIcon from "../Icons/LocationIcon";
import IconTitle from "../UI/IconTitle";
import { tsmRegular, txsDemiBold, txsRegular } from "../UI/Typography";
import classes from "./MedicalCenterContactInfo.module.css";
const MedicalCenterContactInfo = ({
  address,
  businessTimes,
  mail,
  owner,
  phone,
  website,
}: {
  address?: string;
  phone?: string;
  website?: string;
  mail?: string;
  businessTimes?: string;
  owner?: string;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.main} id="contact">
      <IconTitle icon={<LocationIcon />}>{getContent("contactInfo")}</IconTitle>
      <div className={classes.content}>
        {!!address && (
          <p className={`${classes.black} ${tsmRegular}`}>{address}</p>
        )}
        {!!phone && <p className={`${classes.black} ${tsmRegular}`}>{phone}</p>}
        {!!website && (
          <p className={`${classes.black} ${tsmRegular}`}>{website}</p>
        )}
        {!!mail && <p className={`${classes.black} ${tsmRegular}`}>{mail}</p>}
        {!!businessTimes && (
          <p className={`${classes.gray} ${txsRegular}`}>{businessTimes}</p>
        )}
        {owner && (
          <p>
            <span className={classes.gray}>{getContent("management")}</span>
            &nbsp;
            <span className={`${classes.black} ${txsDemiBold}`}>{owner}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default MedicalCenterContactInfo;
