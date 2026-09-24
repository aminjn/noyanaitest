import classes from "./LicenseNotCoveredNotice.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import IconTitle from "../UI/IconTitle";
import Button from "../UI/Button";
import LockIcon from "../Icons/LockIcon";
import {
  HospitalDashboardModule,
  hospitalDashboardModuleLabels,
} from "../Admin/BaseHospitalLicense/AdminManageBaseHospitalLicensesPage";

const NS: ContentNamespace[] = ["common"];

// Shown by HospitalLicenseGate instead of a /hospitalpanel/* page's own content
// when the current hospital's resolved license modules don't include the
// module that page requires. Mirrors
// Components/PharmacyPanel/LicenseNotCoveredNotice.tsx /
// Components/DoctorPanel/LicenseNotCoveredNotice.tsx.
const LicenseNotCoveredNotice = ({
  mod,
}: {
  mod: HospitalDashboardModule;
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
          hospitalDashboardModuleLabels[mod],
        ])}
      </span>
      <Button href="/hospitalpanel/license" variant="Primary" mode="Fill">
        {getContent("buyLicense")}
      </Button>
    </div>
  );
};

export default LicenseNotCoveredNotice;
