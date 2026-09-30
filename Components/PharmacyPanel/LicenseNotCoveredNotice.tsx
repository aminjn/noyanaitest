import classes from "./LicenseNotCoveredNotice.module.css";
import { licenseModuleKey } from "@/Components/_Common/License/licenseModuleKey";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import IconTitle from "../UI/IconTitle";
import Button from "../UI/Button";
import LockIcon from "../Icons/LockIcon";
import {
  PharmacyDashboardModule,
} from "../Admin/BasePharmacyLicense/AdminManageBasePharmacyLicensesPage";

const NS: ContentNamespace[] = ["common"];

// Shown by PharmacyLicenseGate instead of a /pharmacypanel/* page's own
// content when the current pharmacy's resolved license modules don't
// include the module that page requires. Mirrors
// Components/DoctorPanel/LicenseNotCoveredNotice.tsx.
const LicenseNotCoveredNotice = ({
  mod,
}: {
  mod: PharmacyDashboardModule;
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
      <Button href="/pharmacypanel/license" variant="Primary" mode="Fill">
        {getContent("buyLicense")}
      </Button>
    </div>
  );
};

export default LicenseNotCoveredNotice;
