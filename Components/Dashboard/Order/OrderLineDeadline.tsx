import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { tehranDateFormat } from "@/Components/helpers/tehranTime";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";
import { t2xsRegular } from "@/Components/UI/Typography";
import classes from "./OrderLineDeadline.module.css";

const NS: ContentNamespace[] = ["common", "dashboardOrderItemStatusBadge"];

// "Must be answered before ..." under a pending pharmacy / lab line (backend
// Lib/orderResponse.ts). Tehran time, in the reader's calendar (Jalali for
// Persian). Renders nothing for a missing or malformed deadline.
const OrderLineDeadline = ({
  respondBy,
  audience,
  className = "",
}: {
  respondBy?: string | null;
  // the seller is told to answer; the buyer what happens if nobody does
  audience: "seller" | "buyer";
  className?: string;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  if (!respondBy) return null;
  const when = safeFormatDate(
    tehranDateFormat(intlTag, {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }),
    respondBy,
    "",
  );
  if (!when) return null;
  const overdue = new Date(respondBy).getTime() <= Date.now();
  return (
    <span
      className={`${classes.deadline} ${overdue ? classes.overdue : ""} ${t2xsRegular} ${className}`}
    >
      {getContent(audience === "seller" ? "orderRespondBySeller" : "orderRespondByBuyer", [when])}
    </span>
  );
};

export default OrderLineDeadline;
