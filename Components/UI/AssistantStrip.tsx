import classes from "./AssistantStrip.module.css";
import AiOrb from "./AiOrb";

export type AssistantChip = { key: string; label: string; active: boolean; onClick: () => void };

// The assistant's one-line hints above a list; each hint is a filter the
// user can switch on. Renders nothing when there is nothing to say.
const AssistantStrip = ({
  title,
  chips,
  clearLabel,
  onClear,
}: {
  title: string;
  chips: AssistantChip[];
  clearLabel: string;
  onClear: () => void;
}) => {
  if (!chips.length) return null;
  const anyActive = chips.some((c) => c.active);
  return (
    <div className={classes.main}>
      <AiOrb size="2.25rem" />
      <span className={classes.title}>{title}</span>
      <div className={classes.chips}>
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-pressed={c.active}
            className={`${classes.chip} ${c.active ? classes.active : ""}`}
            onClick={c.onClick}
          >
            {c.label}
          </button>
        ))}
        {anyActive && (
          <button type="button" className={classes.clear} onClick={onClear}>
            {clearLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default AssistantStrip;
