import classes from "./LicenseNotCoveredNotice.module.css";
import useLocale from "../Hooks/useLocale";
import IconTitle from "../UI/IconTitle";
import Button from "../UI/Button";
import LockIcon from "../Icons/LockIcon";
import {
  DoctorDashboardModule,
  doctorDashboardModuleLabels,
} from "../Admin/BaseDoctorLicense/AdminManageBaseDoctorLicensesPage";

// Shown by DoctorLicenseGate instead of a /doctorpanel/* page's own content
// when the current doctor's resolved license modules don't include the
// module that page requires.
const LicenseNotCoveredNotice = ({
  mod,
}: {
  mod: DoctorDashboardModule;
}) => {
  const getContent = useLocale();
  return (
    <div className={classes.main}>
      <div className={classes.icon}>
        <LockIcon />
      </div>
      <IconTitle>{getContent("licenseNotCoveredTitle")}</IconTitle>
      <span className={classes.legend}>
        {getContent("licenseNotCoveredLegend", [
          doctorDashboardModuleLabels[mod],
        ])}
      </span>
      <Button href="/doctorpanel/license" variant="Primary" mode="Fill">
        {getContent("buyLicense")}
      </Button>
    </div>
  );
};

export default LicenseNotCoveredNotice;
