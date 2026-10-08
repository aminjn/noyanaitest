"use client";

import { useBecomeRequestStatus } from "./useBecomeRequestStatus";
import { becomeOrgs } from "./becomeOrgs";
import { IBecomePharmacyRequest } from "../PharmacyPanel/BecomePharmacyPage";
import BecomeOrganizationForm from "./BecomeOrganizationForm";
import usePharmacy from "../Hooks/usePharmacy";
import BecomeDoneView from "./BecomeDoneView";

const org = becomeOrgs.pharmacy;

// What's actually submitted - distinct from IBecomePharmacyRequest (the
// fetched/stored shape) because certificateFile is a File here and becomes
// a saved filename string only after upload (see uploadController.
// saveUplaodsToBody on noyanai-back).
type BecomePharmacyRequestInput = {
  name: string;
  siamCode: string;
  nationalId: string;
  certificateDate: Date;
  certificateFile?: File;
  description?: string;
};

// app/become/pharmacy/page.tsx - the pharmacy's own become-request form.
// Models/BecomePharmacyRequest.ts on noyanai-back takes name/siamCode/
// nationalId/certificateDate/certificateFile/description (the rest of the
// pharmacy's profile is filled in later, once an admin approves this
// request).
const toForm = (r: IBecomePharmacyRequest) => ({
  certificateDate: r.certificateDate,
  name: r.name,
  nationalId: r.nationalId,
  siamCode: r.siamCode,
  certificateFile: r.certificateFile,
  description: r.description,
});

const BecomePharmacyRequestPage = () => {
  const { request, mutate } = useBecomeRequestStatus<IBecomePharmacyRequest>(
    org.requestApiPath,
  );

  const { pharmacy } = usePharmacy();

  if (pharmacy)
    return <BecomeDoneView title="becomePharmacyDone" target={org.panelPath} />;

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

export default BecomePharmacyRequestPage;
