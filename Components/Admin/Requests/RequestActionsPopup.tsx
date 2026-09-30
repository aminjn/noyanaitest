"use client";

import { ReactNode } from "react";
import classes from "./RequestDecisionActions.module.css";
import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import RequestDecisionActions from "./RequestDecisionActions";
import { RequestGroup } from "./requestMeta";

// A list row's decision popup (addition and doctor-join requests, whose list
// page is also their detail view): a short summary, then the shared
// decision block. Any decision refreshes the list and closes the popup, so
// it never shows a stale status.
const RequestActionsPopup = ({
  title,
  group,
  kind,
  node,
  mutate,
  approve,
  children,
}: {
  title: string;
  group: RequestGroup;
  kind: string;
  node: { _id: string; status?: string; rejectReason?: string };
  mutate: () => unknown;
  approve?: ReactNode;
  children?: ReactNode;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={title}>
      <div className={classes.popup}>
        {children}
        <RequestDecisionActions
          group={group}
          kind={kind}
          nodeId={node._id}
          status={node.status}
          rejectReason={node.rejectReason}
          mutate={async () => {
            await mutate();
            closePopup();
          }}
          approve={approve}
        />
      </div>
    </PopupCard>
  );
};

export default RequestActionsPopup;
