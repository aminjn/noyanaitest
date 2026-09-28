"use client";

import ActionInbox from "@/Components/UI/ActionInbox";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { CenterRequest, doctorName, doctorSpec } from "./useCenterDoctors";

const NS: ContentNamespace[] = ["common", "centerDoctors"];

// pending "a doctor wants to join" decisions, approve/reject inline
const CenterJoinInbox = ({
  requests,
  busy,
  answer,
}: {
  requests: CenterRequest[];
  busy: string | null;
  answer: (id: string, status: "Approved" | "Rejected") => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  return (
    <ActionInbox
      highlight
      items={requests.map((r) => ({
        id: r._id,
        lead: <InitialAvatar name={doctorName(r.doctor)} seed={r.doctor?._id || r._id} size="2.75rem" />,
        title: doctorName(r.doctor),
        subtitle: doctorSpec(r.doctor),
        body: r.message,
        actions: [
          { label: getContent("cdApprove"), kind: "primary", onClick: () => answer(r._id, "Approved"), disabled: busy === r._id },
          { label: getContent("reject"), kind: "ghost", onClick: () => answer(r._id, "Rejected"), disabled: busy === r._id },
        ],
      }))}
    />
  );
};

export default CenterJoinInbox;
