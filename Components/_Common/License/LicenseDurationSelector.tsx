import classes from "./LicenseDurationSelector.module.css";
import Button from "@/Components/UI/Button";
import { ILicenseDuration } from "./licenseTypes";

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
  if (!durations.length) return null;

  return (
    <div className={`${classes.selector} ${className}`}>
      {durations.map((dur) => (
        <Button
          key={dur._id}
          variant="Primary"
          mode={selectedDuration?._id === dur._id ? "Fill" : "Outline"}
          size="M"
          radius="Medium"
          onClick={() => onSelect(dur)}
        >
          {dur.displayName}
        </Button>
      ))}
    </div>
  );
};

export default LicenseDurationSelector;
