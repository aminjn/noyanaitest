import { ComponentProps } from "react";
import RequestDecisionActions from "../Requests/RequestDecisionActions";
import FormatDate from "@/Components/UI/FormatDate";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./RequestDecisionBanner.module.css";

// The decision on a provider request, at the top of its page (2026-09): the
// current status, the rejection reason and when it was decided, and the
// one-way actions (approve / reject with a reason / reopen) of the shared
// RequestDecisionActions. It replaces the old «عملیات» tab, so the admin
// sees the state before reading the details - the way Doctolib Pro /
// Docplanner verification queues open a record.
const RequestDecisionBanner = ({
  createdAt,
  decidedAt,
  ...decision
}: ComponentProps<typeof RequestDecisionActions> & {
  createdAt?: Date | string;
  decidedAt?: Date | string;
}) => {
  const tone =
    decision.status === "Rejected"
      ? classes.rejected
      : decision.status === "Approved" || decision.status === "Done"
        ? classes.approved
        : classes.pending;
  return (
    <section className={`${classes.main} ${tone}`}>
      <div className={classes.head}>
        <h3 className={classes.title}>{ta("تصمیم درباره درخواست")}</h3>
        <div className={classes.dates}>
          {!!createdAt && (
            <span>
              {ta("تاریخ ثبت")}: <FormatDate value={createdAt} />
            </span>
          )}
          {!!decidedAt && (
            <span>
              {ta("تاریخ تصمیم")}: <FormatDate value={decidedAt} />
            </span>
          )}
        </div>
      </div>
      <RequestDecisionActions {...decision} />
    </section>
  );
};

export default RequestDecisionBanner;
