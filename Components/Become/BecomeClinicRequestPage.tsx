"use client";

import { useBecomeRequestStatus } from "./useBecomeRequestStatus";
import { becomeOrgs } from "./becomeOrgs";
import { IBecomeClinicRequest } from "../ClinicPanel/BecomeClinicPage";
import BecomeOrganizationForm from "./BecomeOrganizationForm";
import useClinic from "../Hooks/useClinic";
import BecomeDoneView from "./BecomeDoneView";
import useAnotherCentre from "./useAnotherCentre";

const org = becomeOrgs.clinic;

// What's actually submitted - distinct from IBecomeClinicRequest (the
// fetched/stored shape) because certificateFile is a File here and becomes
// a saved filename string only after upload (see uploadController.
// saveUplaodsToBody on noyanai-back).
type BecomeClinicRequestInput = {
  name: string;
  siamCode: string;
  nationalId: string;
  certificateDate: Date;
  certificateFile?: File;
  description?: string;
};

// app/become/clinic/page.tsx - the clinic's own become-request form.
// Models/BecomeClinicRequest.ts on noyanai-back takes name/siamCode/
// nationalId/certificateDate/certificateFile/description (the rest of the
// clinic's profile is filled in later, once an admin approves this
// request).
const toForm = (r: IBecomeClinicRequest) => ({
  certificateDate: r.certificateDate,
  name: r.name,
  nationalId: r.nationalId,
  siamCode: r.siamCode,
  certificateFile: r.certificateFile,
  description: r.description,
});

const BecomeClinicRequestPage = () => {
  const { request, mutate } = useBecomeRequestStatus<IBecomeClinicRequest>(
    org.requestApiPath,
  );

  const { clinic } = useClinic();

  const another = useAnotherCentre();

  // an owner asking for another clinic sees the form (and then where that
  // request stands); otherwise an owner is sent to the panel
  if (clinic && !another && request?.status !== "Pending")
    return <BecomeDoneView title="becomeClinicDone" target={org.panelPath} />;

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

export default BecomeClinicRequestPage;
