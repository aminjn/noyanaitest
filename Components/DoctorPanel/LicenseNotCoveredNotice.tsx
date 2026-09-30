import classes from "./LicenseNotCoveredNotice.module.css";
import { licenseModuleKey } from "@/Components/_Common/License/licenseModuleKey";
import useScopedLocale from "../Hooks/useScopedLocale";
import IconTitle from "../UI/IconTitle";
import Button from "../UI/Button";
import LockIcon from "../Icons/LockIcon";
import {
  DoctorDashboardModule,
} from "../Admin/BaseDoctorLicense/AdminManageBaseDoctorLicensesPage";
import { ContentNamespace } from "../Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common"];

// Shown by DoctorLicenseGate instead of a /doctorpanel/* page's own content
// when the current doctor's resolved license modules don't include the
// module that page requires.
const LicenseNotCoveredNotice = ({
  mod,
}: {
  mod: DoctorDashboardModule;
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
          getContent(licenseModuleKey(mod)),
        ])}
      </span>
      <Button href="/doctorpanel/license" variant="Primary" mode="Fill">
        {getContent("buyLicense")}
      </Button>
    </div>
  );
};

export default LicenseNotCoveredNotice;
