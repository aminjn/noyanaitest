import {
  DoctorSecretaryRequestStatus,
  IDoctorSecretaryRequest,
} from "@/Components/DoctorPanel/Secretary/Request/DoctorSecretaryRequestsTab";
import classes from "./SecretaryMutateDoctorRequestPopup.module.css";
import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { useState } from "react";
import useLocale from "@/Components/Hooks/useLocale";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import TableBox from "@/Components/UI/TableBox";
import Act from "@/Components/UI/Act";

const SecretaryMutateDoctorRequestPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IDoctorSecretaryRequest;
}) => {
  const { closePopup } = usePopup();
  const [isLoading, setIsLoading] =
    useState<DoctorSecretaryRequestStatus | null>(null);

  const getContent = useLocale();

  return (
    <PopupCard>
      <TableBox
        title={getContent("secretaryDecideDoctorSecretaryRequestStatus")}
      >
        <FormActions>
          <Button
            onClick={() => {
              if (isLoading) return;
              setIsLoading("Approved");
            }}
            isLoading={isLoading === "Approved"}
          >
            {getContent("approve")}
          </Button>
          <Button
            variant="Danger"
            onClick={() => {
              if (isLoading) return;
              setIsLoading("Rejected");
            }}
            isLoading={isLoading === "Rejected"}
          >
            {getContent("reject")}
          </Button>
        </FormActions>
      </TableBox>
      <Act
        path={!!isLoading ? `${API}/secretary/doctorrequest/${node._id}` : null}
        method="POST"
        onDone={(status) => {
          setIsLoading(null);
          if (!status) return;
          mutate();
          closePopup();
        }}
        payload={{ status: isLoading }}
      />
    </PopupCard>
  );
};

export default SecretaryMutateDoctorRequestPopup;
