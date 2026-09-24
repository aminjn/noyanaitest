import classes from "./LicenseNotCoveredNotice.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import IconTitle from "../UI/IconTitle";
import Button from "../UI/Button";
import LockIcon from "../Icons/LockIcon";
import {
  InsuranceDashboardModule,
  insuranceDashboardModuleLabels,
} from "../Admin/BaseInsuranceLicense/AdminManageBaseInsuranceLicensesPage";

const NS: ContentNamespace[] = ["common"];

// Shown by InsuranceLicenseGate instead of a /insurancepanel/* page's own
// content when the current insurance's resolved license modules don't
// include the module that page requires. Mirrors
// Components/HospitalPanel/LicenseNotCoveredNotice.tsx /
// Components/PharmacyPanel/LicenseNotCoveredNotice.tsx /
// Components/DoctorPanel/LicenseNotCoveredNotice.tsx.
const LicenseNotCoveredNotice = ({
  mod,
}: {
  mod: InsuranceDashboardModule;
}) => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.main}>
      <div className={classes.icon}>
        <LockIcon />
      </div>
      <IconTitle>{getContent("licenseNotCoveredTitle")}</IconTitle>
      <span className={classes.legend}>
        {getContent("licenseNotCoveredLegend", [
          insuranceDashboardModuleLabels[mod],
        ])}
      </span>
      <Button href="/insurancepanel/license" variant="Primary" mode="Fill">
        {getContent("buyLicense")}
      </Button>
    </div>
  );
};

export default LicenseNotCoveredNotice;
