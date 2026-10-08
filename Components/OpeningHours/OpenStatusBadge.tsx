import classes from "./OpenStatusBadge.module.css";
import { txsMedium } from "../UI/Typography";
import useHoursFormat from "./useHoursFormat";
import { OpenStatus } from "./openingHours";

// «باز است · تا ساعت ۲۲:۰۰» / «بسته است · فردا ساعت ۸:۰۰ باز می‌شود»
// (2026-10): the status the backend computed in Tehran time when the page
// was asked for (Lib/openingHours.ts openStatusAt). Nothing when the centre
// gave no hours. One component for every centre card and page.
const OpenStatusBadge = ({
  status,
  className = "",
  compact,
}: {
  status?: OpenStatus | null;
  className?: string;
  // only the headline (a tight card)
  compact?: boolean;
}) => {
  const fmt = useHoursFormat();
  const s = fmt.status(status);
  if (!s) return null;
  return (
    <span className={`${classes.main} ${s.open ? classes.open : classes.closed} ${txsMedium} ${className}`}>
      <span className={classes.dot} aria-hidden />
      <span className={classes.title}>{s.title}</span>
      {!compact && !!s.detail && <span className={classes.detail}>{s.detail}</span>}
    </span>
  );
};

export default OpenStatusBadge;
