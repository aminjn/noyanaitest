import { useState } from "react";
import classes from "./ToggleJoinHospitalRequestStatusPopup.module.css";
import { IDoctorJoinHospitalRequest } from "./DoctorJoinHospitalsTab";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelHospital"];

// Answer to a join request the hospital sent the doctor: approve (creates the
// membership) or reject. POST /doctor/hospitaljoin/:id { status }.
const ToggleJoinHospitalRequestStatusPopup = ({
  node,
  mutate,
}: {
  node: IDoctorJoinHospitalRequest<{ Hospital: Record<never, never> }>;
  mutate: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [loading, setLoading] = useState<"Approved" | "Rejected" | null>(null);

  const respond = async (status: "Approved" | "Rejected") => {
    setLoading(status);
    try {
      await fetcher({
        url: `${API}/doctor/hospitaljoin/${node._id}`,
        method: "POST",
        payload: { status },
      });
      mutate();
      closePopup();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
      setLoading(null);
    }
  };

  const orgName =
    typeof node.hospital === "object" && node.hospital
      ? node.hospital.name || ""
      : "";

  return (
    <PopupCard>
      <div className={classes.main}>
        <p className={classes.message}>
          {getContent("respondToJoinInvitation", [orgName])}
        </p>
        {node.message && <p className={classes.note}>{node.message}</p>}
        <div className={classes.actions}>
          <Button
            variant="Primary"
            onClick={() => respond("Approved")}
            isLoading={loading === "Approved"}
          >
            {getContent("approve")}
          </Button>
          <Button
            variant="Error"
            mode="Outline"
            onClick={() => respond("Rejected")}
            isLoading={loading === "Rejected"}
          >
            {getContent("reject")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

export default ToggleJoinHospitalRequestStatusPopup;
