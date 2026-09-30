import classes from "./LicenseNotCoveredNotice.module.css";
import { licenseModuleKey } from "@/Components/_Common/License/licenseModuleKey";
import useScopedLocale from "../Hooks/useScopedLocale";
import IconTitle from "../UI/IconTitle";
import Button from "../UI/Button";
import LockIcon from "../Icons/LockIcon";
import {
  ClinicDashboardModule,
} from "../Admin/BaseClinicLicense/AdminManageBaseClinicLicensesPage";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common"];

// Shown by ClinicLicenseGate instead of a /clinicpanel/* page's own content
// when the current clinic's resolved license modules don't include the
// module that page requires. Mirrors
// Components/PharmacyPanel/LicenseNotCoveredNotice.tsx /
// Components/DoctorPanel/LicenseNotCoveredNotice.tsx.
const LicenseNotCoveredNotice = ({ mod }: { mod: ClinicDashboardModule }) => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.main}>
      <div className={classes.icon}>
        <LockIcon />
      </div>
      <IconTitle>{getContent("licenseNotCoveredTitle")}</IconTitle>
      <span className={classes.legend}>
        {getContent("licenseNotCoveredLegend", [
          getContent(licenseModuleKey(mod)),
        ])}
      </span>
      <Button href="/clinicpanel/license" variant="Primary" mode="Fill">
        {getContent("buyLicense")}
      </Button>
    </div>
  );
};

export default LicenseNotCoveredNotice;
