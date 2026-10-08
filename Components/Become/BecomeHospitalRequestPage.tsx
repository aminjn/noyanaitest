"use client";

import { FormEvent } from "react";
import useForm from "../Hooks/useForm";
import HandleLoading from "../Admin/UI/HandleLoading";
import { API } from "../config";
import { useBecomeRequestStatus } from "./useBecomeRequestStatus";
import { becomeOrgs } from "./becomeOrgs";
import { IBecomeHospitalRequest } from "../HospitalPanel/BecomeHospitalPage";
import BecomeOrganizationForm from "./BecomeOrganizationForm";
import useHospital from "../Hooks/useHospital";
import BecomeDoneView from "./BecomeDoneView";
import useAnotherCentre from "./useAnotherCentre";

const org = becomeOrgs.hospital;

// What's actually submitted - distinct from IBecomeHospitalRequest (the
// fetched/stored shape) because certificateFile is a File here and becomes
// a saved filename string only after upload (see uploadController.
// saveUplaodsToBody on noyanai-back).
type BecomeHospitalRequestInput = {
  name: string;
  siamCode: string;
  nationalId: string;
  certificateDate: Date;
  certificateFile?: File;
  description?: string;
};

// app/become/hospital/page.tsx - the hospital's own become-request form.
// Models/BecomeHospitalRequest.ts on noyanai-back takes name/siamCode/
// nationalId/certificateDate/certificateFile/description (the rest of the
// hospital's profile is filled in later, once an admin approves this
// request). JSX is bare - CSS and markup are meant to be redone by hand.
const toForm = (r: IBecomeHospitalRequest) => ({
  certificateDate: r.certificateDate,
  name: r.name,
  nationalId: r.nationalId,
  siamCode: r.siamCode,
  certificateFile: r.certificateFile,
  description: r.description,
});

const BecomeHospitalRequestPage = () => {
  const { request, mutate } = useBecomeRequestStatus<IBecomeHospitalRequest>(
    org.requestApiPath,
  );

  const { hospital } = useHospital();

  const another = useAnotherCentre();

  // an owner asking for another hospital sees the form (and then where that
  // request stands); otherwise an owner is sent to the panel
  if (hospital && !another && request?.status !== "Pending")
    return <BecomeDoneView title="becomeHospitalDone" target={org.panelPath} />;

  return (
    <BecomeOrganizationForm
      org={org}
      mutate={mutate}
      pending={request?.status === "Pending" ? toForm(request) : undefined}
      rejected={request?.status === "Rejected" ? toForm(request) : undefined}
      rejectReason={request?.status === "Rejected" ? request.rejectReason : undefined}
    />
  );
};

export default BecomeHospitalRequestPage;
