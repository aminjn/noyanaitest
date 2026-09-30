"use client";

import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import CreateFromAdditionPopup, {
  AdditionKind,
} from "../UI/CreateFromAdditionPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// approve an addition request: the existing "create the centre" flow
export const AdditionApproveButton = ({
  kind,
  requestId,
  label,
  mutate,
}: {
  kind: AdditionKind;
  requestId: string;
  label: string;
  mutate: () => unknown;
}) => {
  const { setPopup } = usePopup();
  return (
    <Button
      variant="Success"
      onClick={() =>
        setPopup(
          "CreateFromAddition",
          <CreateFromAdditionPopup
            kind={kind}
            requestId={requestId}
            mutate={mutate}
          />,
        )
      }
    >
      {label}
    </Button>
  );
};

// approve a doctor's request to join a centre: the backend adds the
// membership, closes the request and tells the doctor
export const JoinApproveButton = ({
  kind,
  requestId,
  mutate,
}: {
  kind: "clinic" | "hospital";
  requestId: string;
  mutate: () => unknown;
}) => {
  const [busy, setBusy] = useState(false);
  const pushNotification = useNotification();
  const { closePopup } = usePopup();
  const approve = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/admin/doctorjoin/${kind}/${requestId}/decide`,
        method: "POST",
        payload: { decision: "Approved" },
        bodyParser: "JSON",
      });
      pushNotification(ta("پزشک به مرکز متصل شد."), "Success");
      await mutate();
      closePopup();
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button variant="Success" isLoading={busy} onClick={approve}>
      {ta("تأیید و اتصال پزشک")}
    </Button>
  );
};
