import classes from "./LicenseNotCoveredNotice.module.css";
import useLocale from "@/Components/Hooks/useLocale";
import IconTitle from "@/Components/UI/IconTitle";
import Button from "@/Components/UI/Button";
import LockIcon from "@/Components/Icons/LockIcon";
import {
  ParaClinicDashboardModule,
  paraClinicDashboardModuleLabels,
} from "@/Components/Admin/BaseParaClinicLicense/AdminManageBaseParaClinicLicensesPage";

// Shown by ParaClinicLicenseGate instead of a /paraClinicPanel/* page's own
// content when the current paraClinic's resolved license modules don't
// include the module that page requires. Mirrors
// Components/PharmacyPanel/LicenseNotCoveredNotice.tsx.
const LicenseNotCoveredNotice = ({
  mod,
}: {
  mod: ParaClinicDashboardModule;
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
          paraClinicDashboardModuleLabels[mod],
        ])}
      </span>
      <Button href="/paraClinicPanel/license" variant="Primary" mode="Fill">
        {getContent("buyLicense")}
      </Button>
    </div>
  );
};

export default LicenseNotCoveredNotice;
