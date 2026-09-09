"use client";

import { useBecomeRequestStatus } from "./useBecomeRequestStatus";
import { becomeOrgs } from "./becomeOrgs";
import { IBecomeParaClinicRequest } from "../Layout/BecomeParaClinicPage";
import BecomeOrganizationForm from "./BecomeOrganizationForm";
import useParaClinic from "../Hooks/useParaClinic";
import BecomeDoneView from "./BecomeDoneView";

const org = becomeOrgs.paraClinic;

// What's actually submitted - distinct from IBecomeParaClinicRequest (the
// fetched/stored shape) because certificateFile is a File here and becomes
// a saved filename string only after upload (see uploadController.
// saveUplaodsToBody on noyanai-back).
type BecomeParaClinicRequestInput = {
  name: string;
  siamCode: string;
  nationalId: string;
  certificateDate: Date;
  certificateFile?: File;
  description?: string;
};

// app/become/paraClinic/page.tsx - the para-clinic's own become-request form.
// Models/BecomeParaClinicRequest.ts on noyanai-back takes name/siamCode/
// nationalId/certificateDate/certificateFile/description (the rest of the
// para-clinic's profile is filled in later, once an admin approves this
// request).
const BecomeParaClinicRequestPage = () => {
  const { request, mutate } = useBecomeRequestStatus<IBecomeParaClinicRequest>(
    org.requestApiPath,
  );

  const { paraClinic } = useParaClinic();

  if (paraClinic)
    return <BecomeDoneView title="becomeParaClinicDone" target={org.panelPath} />;

  return (
    <BecomeOrganizationForm
      org={org}
      mutate={mutate}
      pending={
        request
          ? {
              certificateDate: request.certificateDate,
              name: request.name,
              nationalId: request.nationalId,
              siamCode: request.siamCode,
              certificateFile: request.certificateFile,
              description: request.description,
            }
          : undefined
      }
    />
  );
};

export default BecomeParaClinicRequestPage;
