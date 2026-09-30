import { IDoctorJoinHospitalRequest } from "@/Components/DoctorPanel/Hospital/DoctorJoinHospitalsTab";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { useState } from "react";
import Act from "@/Components/UI/Act";
import Button from "@/Components/UI/Button";
import FormActions from "../UI/FormActions";
import Box from "../UI/Box";
import { getHospitalLabel, getDoctorProfileLabel } from "../Lib/LabelGetters";
import { ta } from "@/Components/Admin/i18n/adminText";

// Approve or reject a doctor's request to join a hospital (2026-09): the backend
// creates the membership on approval and always closes the request - it used
// to create the membership only and leave the request pending forever.
const EditDoctorJoinHospitalStatusPopup = ({
  mutate,
  node,
}: {
  node: IDoctorJoinHospitalRequest<{
    Hospital: Record<never, never>;
    Doctor: Record<never, never>;
  }>;
  mutate: () => unknown;
}) => {
  const [decision, setDecision] = useState<"Approved" | "Rejected" | null>(null);
  const { closePopup } = usePopup();
  return (
    <Box>
      <p>
        {ta("درخواست عضویت دکتر ${1} در ${2}", [node.doctor ? getDoctorProfileLabel(node.doctor) : "", node.hospital ? getHospitalLabel(node.hospital) : ""])}
      </p>
      <FormActions>
        <Button isLoading={decision === "Approved"} onClick={() => setDecision("Approved")}>
          {ta("تأیید و اتصال پزشک")}
        </Button>
        <Button variant="Error" isLoading={decision === "Rejected"} onClick={() => setDecision("Rejected")}>
          {ta("رد درخواست")}
        </Button>
        <Button variant="Neutral" onClick={() => closePopup()}>
          {ta("انصراف")}
        </Button>
      </FormActions>
      <Act
        path={decision ? `${API}/admin/doctorjoin/hospital/${node._id}/decide` : null}
        method="POST"
        payload={{ decision: decision || undefined }}
        onDone={(status) => {
          setDecision(null);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Box>
  );
};

export default EditDoctorJoinHospitalStatusPopup;
