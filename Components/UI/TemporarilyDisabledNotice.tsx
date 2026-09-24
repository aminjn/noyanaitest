import classes from "./TemporarilyDisabledNotice.module.css";
import IconTitle from "./IconTitle";
import ClockIcon from "../Icons/ClockIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

// Tamin end-user lockout (2026-09) — shown by DoctorLicenseGate/
// PharmacyLicenseGate/ClinicLicenseGate/ParaClinicLicenseGate instead of a
// panel page's own content while that page's whole feature (drug/
// prescription/tamin) is locked out for real end users. See
// Controllers/featureGateController.ts on noyanai-back for the matching
// backend-side gate — this is purely cosmetic (the API already 403s), it
// just avoids showing a broken/loading page and firing failed requests.
//
// Deliberately styled/structured like DoctorPanel/LicenseNotCoveredNotice.tsx
// (same layout, no CTA button since there's nothing the user can do to
// unlock this - it isn't about their license).
const TemporarilyDisabledNotice = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  return (
    <div className={classes.main}>
      <div className={classes.icon}>
        <ClockIcon />
      </div>
      <IconTitle>{getContent("featureTemporarilyDisabledTitle")}</IconTitle>
      <span className={classes.legend}>
        {getContent("featureTemporarilyDisabledLegend")}
      </span>
    </div>
  );
};

export default TemporarilyDisabledNotice;
