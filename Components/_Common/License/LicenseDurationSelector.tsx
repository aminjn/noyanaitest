import classes from "./LicenseDurationSelector.module.css";
import { ILicenseDuration } from "./licenseTypes";
import useLicensePeriodLabel from "./useLicensePeriodLabel";

// Shared duration picker used by both LicensePlansPage ("/<panel>/license")
// and AllLicensePlansPage ("/<panel>/license/all") - a row of pill buttons,
// one per LicenseDuration, that reports the chosen one back via `onSelect`
// so each page can drive its own selectedDuration state (used to pick the
// right pricing option per plan). Renders nothing when there are no
// durations to choose from.
const LicenseDurationSelector = ({
  durations,
  selectedDuration,
  onSelect,
  className = "",
}: {
  durations: ILicenseDuration[];
  selectedDuration: ILicenseDuration | null;
  onSelect: (duration: ILicenseDuration) => void;
  className?: string;
}) => {
  const periodLabel = useLicensePeriodLabel();
  if (!Array.isArray(durations) || !durations.length) return null;

  return (
    <div className={`${classes.selector} ${className}`} role="tablist">
      {durations.map((dur) => (
        <button
          key={dur._id}
          type="button"
          role="tab"
          aria-selected={selectedDuration?._id === dur._id}
          className={`${classes.option} ${selectedDuration?._id === dur._id ? classes.on : ""}`}
          onClick={() => onSelect(dur)}
        >
          {periodLabel(dur.duration)}
        </button>
      ))}
    </div>
  );
};

export default LicenseDurationSelector;
