import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Button from "@/Components/UI/Button";
import { Fragment, useState } from "react";
import usePrescription from "../Store/usePrescription";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionCreate"];

const VisitPrescription = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { patient } = usePrescription();

  if (!patient) return null;
  return (
    <Fragment>
      <Button isLoading={isLoading} onClick={() => setIsLoading(true)}>
        {getContent("makeVisitPrescription")}
      </Button>
      <Act
        path={isLoading ? `${API}/doctor/presc2/visit` : null}
        method="POST"
        onDone={(status) => {
          setIsLoading(false);
        }}
        successMessage="VisitPrescriptionCreated"
        payload={{ patient: patient._id }}
      />
    </Fragment>
  );
};

export default VisitPrescription;
