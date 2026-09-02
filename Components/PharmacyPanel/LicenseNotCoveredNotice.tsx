import classes from "./LicenseNotCoveredNotice.module.css";
import useLocale from "../Hooks/useLocale";
import IconTitle from "../UI/IconTitle";
import Button from "../UI/Button";
import LockIcon from "../Icons/LockIcon";
import {
  PharmacyDashboardModule,
  pharmacyDashboardModuleLabels,
} from "../Admin/BasePharmacyLicense/AdminManageBasePharmacyLicensesPage";

// Shown by PharmacyLicenseGate instead of a /pharmacypanel/* page's own
// content when the current pharmacy's resolved license modules don't
// include the module that page requires. Mirrors
// Components/DoctorPanel/LicenseNotCoveredNotice.tsx.
const LicenseNotCoveredNotice = ({
  mod,
}: {
  mod: PharmacyDashboardModule;
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
          pharmacyDashboardModuleLabels[mod],
        ])}
      </span>
      <Button href="/pharmacypanel/license" variant="Primary" mode="Fill">
        {getContent("buyLicense")}
      </Button>
    </div>
  );
};

export default LicenseNotCoveredNotice;
