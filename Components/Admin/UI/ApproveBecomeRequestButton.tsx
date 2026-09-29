"use client";

import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import Button from "@/Components/UI/Button";
import useNotification from "@/Components/Hooks/useNotification";
import useProgress from "@/Components/Hooks/useProgress";

// One-step approval of a "become X" request (2026-09), shared by every
// request page: the backend creates (or activates) the centre / doctor
// profile from the request, links the applicant, marks the request approved
// and notifies them; the admin then lands on the created record.
// Shown only while the request is pending - a rejected one must be reopened.
const ApproveBecomeRequestButton = ({
  requestPath,
  nodeId,
  status,
  label,
  done,
  target,
  mutate,
}: {
  // e.g. "becomeclinic" -> POST /admin/becomeclinic/:nodeId/approve
  requestPath: string;
  nodeId: string;
  status?: string;
  label: string;
  done: string;
  // admin page of the created record, e.g. (id) => `/clinic/${id}`
  target: (id: string) => string;
  mutate: () => unknown;
}) => {
  const [busy, setBusy] = useState(false);
  const pushNotification = useNotification();
  const push = useProgress();

  if (status && status !== "Pending") return null;

  const approve = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: `${API}/admin/${requestPath}/${nodeId}/approve`,
        method: "POST",
      });
      pushNotification(done, "Success");
      await mutate();
      const id = res?.data?.node?._id;
      if (id) push(adminPath(target(id)));
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button isLoading={busy} onClick={approve}>
      {label}
    </Button>
  );
};

export default ApproveBecomeRequestButton;
