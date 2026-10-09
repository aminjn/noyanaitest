import BecomeOrganizationForm, { becomeRequestFormValues } from "../Become/BecomeOrganizationForm";
import { becomeOrgs } from "../Become/becomeOrgs";
import { IBecomeClinicRequest } from "./BecomeClinicPage";

const org = becomeOrgs.clinic;

// The panel's own "become a clinic" form (shown when the account has no
// clinic yet) is the same form as /become/clinic (2026-10): it used to be a
// second, generic form that asked fewer things (no licence expiry) and lost
// a declined request's values. The panel draws the request's status
// (BecomeRequestStatus); this is the form under it, prefilled from a
// declined request.
const SubmitBecomeClinicRequest = ({
  mutate,
  request,
}: {
  mutate: () => unknown;
  request?: IBecomeClinicRequest | null;
}) => (
  <BecomeOrganizationForm
    org={org}
    mutate={mutate}
    hideStatus
    rejected={request && request.status !== "Pending" ? becomeRequestFormValues(org, request) : undefined}
  />
);

export default SubmitBecomeClinicRequest;
