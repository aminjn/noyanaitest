"use client";

import { FormEvent } from "react";
import useLocale from "../Hooks/useLocale";
import useForm from "../Hooks/useForm";
import HandleLoading from "../Admin/UI/HandleLoading";
import { API } from "../config";
import { useBecomeRequestStatus } from "./useBecomeRequestStatus";
import { becomeOrgs } from "./becomeOrgs";
import { IBecomeHospitalRequest } from "../HospitalPanel/BecomeHospitalPage";
import BecomeOrganizationForm from "./BecomeOrganizationForm";
import useHospital from "../Hooks/useHospital";
import BecomeDoneView from "./BecomeDoneView";

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
const BecomeHospitalRequestPage = () => {
  const { request, mutate } = useBecomeRequestStatus<IBecomeHospitalRequest>(
    org.requestApiPath,
  );

  const { hospital } = useHospital();

  if (hospital)
    return <BecomeDoneView title="becomeHospitalDone" target="hospitalPanel" />;

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

export default BecomeHospitalRequestPage;
