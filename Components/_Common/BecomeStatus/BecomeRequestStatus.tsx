"use client";

import { ReactNode } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import classes from "./BecomeRequestStatus.module.css";

// Where a "become a clinic / hospital / pharmacy / lab / insurer" request
// stands (2026-10). A rejected one shows the admin's reason and the form
// again (the backend takes a new request after a rejection); before, the
// applicant only read "rejected" with no way forward.
const BecomeRequestStatus = ({
  request,
  form,
}: {
  // profileMissing: approved, but what it created was deleted since - the
  // applicant may send it again
  request?: { status?: string; rejectReason?: string; profileMissing?: boolean } | null;
  form: ReactNode;
}) => {
  const getContent = useScopedLocale();
  if (!request) return <>{form}</>;
  if (request.status === "Pending")
    return <p className={classes.note}>{getContent("requestBeingProcessedByAdmin")}</p>;
  if (request.status === "Approved" && request.profileMissing)
    return (
      <div className={classes.main}>
        <p className={classes.note}>{getContent("becomeProfileRemoved")}</p>
        {form}
      </div>
    );
  if (request.status === "Approved")
    return <p className={classes.note}>{getContent("requestApprovedCreatingProfile")}</p>;
  return (
    <div className={classes.main}>
      <div className={classes.rejected}>
        <strong>{getContent("yourRequestWasRejected")}</strong>
        {!!request.rejectReason && <p>{request.rejectReason}</p>}
      </div>
      {form}
    </div>
  );
};

export default BecomeRequestStatus;
