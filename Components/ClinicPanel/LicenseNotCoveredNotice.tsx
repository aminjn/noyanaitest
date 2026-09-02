import classes from "./LicenseNotCoveredNotice.module.css";
import useLocale from "../Hooks/useLocale";
import IconTitle from "../UI/IconTitle";
import Button from "../UI/Button";
import LockIcon from "../Icons/LockIcon";
import {
  ClinicDashboardModule,
  clinicDashboardModuleLabels,
} from "../Admin/BaseClinicLicense/AdminManageBaseClinicLicensesPage";

// Shown by ClinicLicenseGate instead of a /clinicpanel/* page's own content
// when the current clinic's resolved license modules don't include the
// module that page requires. Mirrors
// Components/PharmacyPanel/LicenseNotCoveredNotice.tsx /
// Components/DoctorPanel/LicenseNotCoveredNotice.tsx.
const LicenseNotCoveredNotice = ({
  mod,
}: {
  mod: ClinicDashboardModule;
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
          clinicDashboardModuleLabels[mod],
        ])}
      </span>
      <Button href="/clinicpanel/license" variant="Primary" mode="Fill">
        {getContent("buyLicense")}
      </Button>
    </div>
  );
};

export default LicenseNotCoveredNotice;
