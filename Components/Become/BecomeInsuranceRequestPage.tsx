"use client";

import { useBecomeRequestStatus } from "./useBecomeRequestStatus";
import { becomeOrgs } from "./becomeOrgs";
import { IBecomeInsuranceRequest } from "../Layout/InsurancePanelLayout";
import BecomeOrganizationForm from "./BecomeOrganizationForm";
import useInsurance from "../Hooks/useInsurance";
import BecomeDoneView from "./BecomeDoneView";

const org = becomeOrgs.insurance;

// What's actually submitted - distinct from IBecomeInsuranceRequest (the
// fetched/stored shape) because certificateFile is a File here and becomes
// a saved filename string only after upload (see uploadController.
// saveUplaodsToBody on noyanai-back).
type BecomeInsuranceRequestInput = {
  name: string;
  siamCode: string;
  nationalId: string;
  certificateDate: Date;
  certificateFile?: File;
  description?: string;
};

// app/become/insurance/page.tsx - the insurance's own become-request form.
// Models/BecomeInsuranceRequest.ts on noyanai-back takes name/siamCode/
// nationalId/certificateDate/certificateFile/description (the rest of the
// insurance's profile is filled in later, once an admin approves this
// request).
const toForm = (r: IBecomeInsuranceRequest) => ({
  certificateDate: r.certificateDate,
  name: r.name,
  nationalId: r.nationalId,
  siamCode: r.siamCode,
  certificateFile: r.certificateFile,
  description: r.description,
});

const BecomeInsuranceRequestPage = () => {
  const { request, mutate } = useBecomeRequestStatus<IBecomeInsuranceRequest>(
    org.requestApiPath,
  );

  const { insurance } = useInsurance();

  if (insurance)
    return (
      <BecomeDoneView title="becomeInsuranceDone" target={org.panelPath} />
    );

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

export default BecomeInsuranceRequestPage;
